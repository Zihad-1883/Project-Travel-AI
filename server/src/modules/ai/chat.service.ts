import { ObjectId } from "mongodb";
import { getDb } from "../../config/db";
import { Groq } from "groq-sdk";
import { env } from "../../config/env";
import { packagesService } from "../packages/packages.service";
import { bookingsService } from "../bookings/bookings.service";

export interface DBMessage {
  _id?: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ChatMessageParam {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
}

const getCollection = () => {
  return getDb().collection<DBMessage>("chatMessages");
};

let groqInstance: Groq | null = null;
function getGroq(): Groq {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in the environment variables!");
  }
  if (!groqInstance) {
    groqInstance = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqInstance;
}

// Persist user-facing messages in the DB
async function getHistory(userId: string): Promise<DBMessage[]> {
  if (!ObjectId.isValid(userId)) return [];
  return getCollection()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: 1 })
    .toArray();
}

async function addMessage(userId: string, role: "user" | "assistant", content: string): Promise<DBMessage> {
  const message: DBMessage = {
    userId: new ObjectId(userId),
    role,
    content,
    createdAt: new Date(),
  };
  await getCollection().insertOne(message);
  return message;
}

async function clearHistory(userId: string): Promise<void> {
  if (!ObjectId.isValid(userId)) return;
  await getCollection().deleteMany({ userId: new ObjectId(userId) });
}

// Definition of the tools available to Groq
const tools = [
  {
    type: "function" as const,
    function: {
      name: "searchPackages",
      description: "Search the database of available travel packages using search query, location, price range (budget), rating, and sorting.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "General keyword to find matching titles or description words" },
          location: { type: "string", description: "Filter by destination city/country" },
          minPrice: { type: "number", description: "Lower boundary price filter" },
          maxPrice: { type: "number", description: "Higher boundary price filter" },
          minRating: { type: "number", description: "Minimal rating limit between 1.0 and 5.0" },
          sortBy: { 
            type: "string", 
            enum: ["price_asc", "price_desc", "rating", "newest"], 
            description: "Sorting parameter for package lists" 
          },
          limit: { type: "number", description: "Limit number of packages to return (default 6)" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getUserBookings",
      description: "Retrieve all travel bookings and status files for the active user session.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

interface BookingWithDetails {
  _id?: ObjectId;
  userId: ObjectId;
  packageId: ObjectId;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  packageDetails?: {
    title: string;
    location: string;
    price: number;
    duration: string;
  };
}

// Handles AI tools execution and formats results
async function executeTool(name: string, args: Record<string, unknown>, userId: string): Promise<string> {
  try {
    if (name === "searchPackages") {
      console.log("AI executing tool 'searchPackages' with args:", args);
      const search = typeof args.search === "string" ? args.search : undefined;
      const location = typeof args.location === "string" ? args.location : undefined;
      const minPrice = typeof args.minPrice === "number" ? args.minPrice : undefined;
      const maxPrice = typeof args.maxPrice === "number" ? args.maxPrice : undefined;
      const minRating = typeof args.minRating === "number" ? args.minRating : undefined;
      const sortBy = typeof args.sortBy === "string" ? args.sortBy as "price_asc" | "price_desc" | "rating" | "newest" : undefined;
      const limit = typeof args.limit === "number" ? args.limit : undefined;

      const result = await packagesService.findAll({
        search,
        location,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
        limit,
        page: 1
      });
      
      if (!result.packages || result.packages.length === 0) {
        return "No travel packages found in the database matching these criteria.";
      }
      
      const serialized = result.packages.map(p => ({
        id: p._id?.toString(),
        title: p.title,
        location: p.location,
        price: p.price,
        duration: p.duration,
        rating: p.rating,
        shortDescription: p.shortDescription
      }));
      return JSON.stringify(serialized);
    } 
    
    if (name === "getUserBookings") {
      console.log("AI executing tool 'getUserBookings' for user:", userId);
      const bookings = await bookingsService.findTravelerBookings(userId) as unknown as BookingWithDetails[];
      if (!bookings || bookings.length === 0) {
        return "The traveler has no past or current bookings or requests in our records.";
      }
      
      const serialized = bookings.map(b => {
        const pkgDetails = b.packageDetails;
        return {
          bookingId: b._id?.toString(),
          packageId: b.packageId.toString(),
          status: b.status,
          createdAt: b.createdAt,
          packageTitle: pkgDetails?.title || "Unknown Package",
          packageLocation: pkgDetails?.location || "Unknown Location",
          packagePrice: pkgDetails?.price || 0,
          packageDuration: pkgDetails?.duration || ""
        };
      });
      return JSON.stringify(serialized);
    }
    
    return `Unknown tool context: ${name}`;
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return `An error occurred while calling database lookup tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Main streaming response function
async function handleChatStream(
  userId: string,
  userMessage: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error | unknown) => void
): Promise<void> {
  try {
    const groq = getGroq();
    
    // Save user message to database
    await addMessage(userId, "user", userMessage);
    
    // Read all previous dialog history
    const history = await getHistory(userId);
    
    // Construct message stack for Groq
    const messageStack: ChatMessageParam[] = [
      {
        role: "system",
        content: `You are Travel AI Assistant, a premium, friendly, and expert concierge for the Travel AI digital platform.
Your goal is to assist travelers with finding catalog packages, analyzing their trip options, and managing their planning.
Current local date is: ${new Date().toLocaleDateString()}.

Rules:
1. Always look up matching packages by calling 'searchPackages' whenever the traveler asks for destinations, cheap packages, itineraries, hikes, beach packages, or options. Make recommendations based on ACTUAL catalog items. Do NOT make up package IDs or locations.
2. If the user asks about their bookings or status, call 'getUserBookings' immediately.
3. Be friendly, expert, and structured. Offer follow-up questions or hints to narrow searches (e.g. "budget adjustments", "shorter durations").
4. Provide structured, clean Markdown output. Use tables or lists for package comparisons.`
      }
    ];
    
    // Build context up to now (excluding current turn which is already saved)
    // We format past DB history into parameters
    history.forEach(msg => {
      messageStack.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    });

    console.log("Starting Groq chat completion run. Message count:", messageStack.length);

    type MessagesInput = Parameters<typeof groq.chat.completions.create>[0]["messages"];

    // Turn 1: Decision on whether tool calls are required
    const initialCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messageStack as unknown as MessagesInput,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const choice = initialCompletion.choices[0];
    const toolCalls = choice?.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Groq suggested tool calls:", toolCalls.length);
      
      // Append assistant's thoughts containing tool calls to keep context correct
      messageStack.push({
        role: "assistant",
        content: choice.message.content || "",
        tool_calls: toolCalls
      } as unknown as ChatMessageParam);

      // Execute each tool Call
      for (const call of toolCalls) {
        const name = call.function.name;
        const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        const result = await executeTool(name, args, userId);
        
        messageStack.push({
          role: "tool",
          tool_call_id: call.id,
          name: name,
          content: result
        } as unknown as ChatMessageParam);
      }
    }

    // Turn 2: Generate response (with tools integrated) and STREAM it back
    console.log("Triggering final stream completion response...");
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messageStack as unknown as MessagesInput,
      stream: true,
      temperature: 0.4
    });

    let fullAnswer = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullAnswer += text;
        onChunk(text);
      }
    }

    // Persist final assistant response
    if (fullAnswer.trim()) {
      await addMessage(userId, "assistant", fullAnswer);
    }
    
    onDone(fullAnswer);
  } catch (error) {
    console.error("Error in chat service stream flow:", error);
    onError(error);
  }
}

export const chatService = {
  getHistory,
  addMessage,
  clearHistory,
  handleChatStream,
};

