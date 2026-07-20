import { packagesService } from "../packages/packages.service";
import { userService } from "../user/user.service";
import { groqService } from "./groq.service";

export interface TravelPreferences {
  location?: string;
  maxPrice?: number;
  duration?: string;
  travelStyle?: "luxury" | "budget" | "adventure" | "culture" | "relaxation" | string;
  interests?: string[];
  customInstruction?: string;
}

export interface RecommendationResult {
  packageId: string;
  matchScore: number; // 0 to 100
  matchReason: string;
}

export interface AIRecommendationResponse {
  recommendations: RecommendationResult[];
}

async function getRecommendations(
  userId: string,
  preferences: TravelPreferences
): Promise<RecommendationResult[]> {
  try {
    // 1. Fetch all packages from the catalog (database grounded candidates)
    const packagesData = await packagesService.findAll({ limit: 50 });
    const availablePackages = packagesData.packages;

    if (availablePackages.length === 0) {
      return [];
    }

    // 2. Fetch traveler's recent interactions (implicit signals)
    const recentInteractions = await userService.getInteractionsForUser(userId);
    
    // Resolve recent interactions to add package details context
    const resolvedInteractionsContext = await Promise.all(
      recentInteractions.slice(0, 10).map(async (interaction) => {
        const pkg = await packagesService.findById(interaction.packageId.toString());
        if (!pkg) return null;
        return {
          title: pkg.title,
          location: pkg.location,
          type: interaction.type, // 'view' or 'save'
          date: interaction.createdAt,
        };
      })
    );
    const interactionHistoryString = resolvedInteractionsContext
      .filter((history) => history !== null)
      .map((h) => `User ${h!.type}ed "${h!.title}" in ${h!.location}`)
      .join(", ");

    // 3. Construct prompt incorporating preferences and interaction history
    const systemPrompt = `You are an expert travel agent AI. You specialize in analyzing traveler preferences and interaction histories to recommend catalog packages.
You must output a raw JSON object containing an array called "recommendations".
Each item in "recommendations" must have EXACTLY this structure:
{
  "packageId": "string (the exact ID of the package)",
  "matchScore": number (integer between 0 and 100 matching how well it aligns),
  "matchReason": "string (1-2 sentences explaining why this matches their preferences and logs)"
}

Rules:
1. ONLY recommend packages from the provided candidates list. Do NOT invent packages or locations.
2. The JSON structure must contain ONLY the "recommendations" root key. Do not write any explanations before or after the JSON code.`;

    const userPrompt = `Here is the list of available Travel Packages candidates:
${availablePackages
  .map(
    (pkg) =>
      `- ID: ${pkg._id?.toString()}\n  Title: "${pkg.title}"\n  Location: "${pkg.location}"\n  Price: $${pkg.price}\n  Duration: "${pkg.duration}"\n  Rating: ${pkg.rating}★\n  Description: "${pkg.shortDescription}"`
  )
  .join("\n\n")}

Here is the traveler's active preferences for this search request:
${
  preferences.location ? `- Preferred Location: ${preferences.location}\n` : ""
}${preferences.maxPrice ? `- Max Budget Rate: $${preferences.maxPrice}\n` : ""}${
      preferences.duration ? `- Desired Duration: ${preferences.duration}\n` : ""
    }${preferences.travelStyle ? `- Travel Style Style: ${preferences.travelStyle}\n` : ""}${
      preferences.interests && preferences.interests.length > 0
        ? `- Explicit Interests: ${preferences.interests.join(", ")}\n`
        : ""
    }${preferences.customInstruction ? `- Additional Custom Instructions/Refinement: "${preferences.customInstruction}"\n` : ""}

Here is the traveler's recent interaction logs history:
"${interactionHistoryString || "No history yet structure (fresh traveler profile)."}"

Analyze these details and supply a compiled list of recommended options. Sort by matchScore in descending order. Make sure output is a valid JSON object matching the requested schema.`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    // 4. Send request to Groq SDK
    const rawContent = await groqService.getChatCompletion(chatMessages, {
      temperature: 0.2, // Low temperature for high precision output
      jsonMode: true,
    });

    // 5. Parse and validate JSON structure response
    let parsed: AIRecommendationResponse;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch (parseError) {
      console.error("AI returned malformed JSON response:", rawContent);
      throw new Error("Could not parse AI recommendation response format.");
    }

    if (!parsed || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid response keys schema: 'recommendations' array does not exist.");
    }

    // 6. Validate and sanitize response entries (must map to actual packages in the list)
    const validPackageIds = new Set(availablePackages.map((p) => p._id?.toString()));
    const validatedRecommendations = parsed.recommendations
      .filter((rec) => {
        const isValidId = validPackageIds.has(rec.packageId);
        const hasScore = typeof rec.matchScore === "number";
        const hasReason = typeof rec.matchReason === "string";
        return isValidId && hasScore && hasReason;
      })
      .map((rec) => {
        const pkg = availablePackages.find((p) => p._id?.toString() === rec.packageId);
        return {
          packageId: rec.packageId,
          matchScore: Math.min(Math.max(Math.round(rec.matchScore), 0), 100), // boundary check
          matchReason: rec.matchReason.trim(),
          package: pkg,
        };
      });

    return validatedRecommendations;
  } catch (error) {
    console.error("AI Recommendation Service failed:", error);
    // Explicit Try/Catch fallback per rules.md §5
    // Fall back to a programmatic match if AI is unavailable rather than failing hard
    return getProgrammaticFallbackRecommendations(userId, preferences);
  }
}

async function getProgrammaticFallbackRecommendations(
  userId: string,
  preferences: TravelPreferences
): Promise<RecommendationResult[]> {
  try {
    console.log("Using static programmatic rule matches back-up recommendation engine.");
    const packagesData = await packagesService.findAll({ limit: 12 });
    const available = packagesData.packages;

    const fallbacks: RecommendationResult[] = available.map((pkg) => {
      let score = 70; // baseline rating
      const reasons: string[] = [];

      if (preferences.location && pkg.location.toLowerCase().includes(preferences.location.toLowerCase())) {
        score += 20;
        reasons.push(`matches your preferred destination of ${pkg.location}`);
      }

      if (preferences.maxPrice && pkg.price <= preferences.maxPrice) {
        score += 10;
        reasons.push("fits neatly within your requested budget boundaries");
      }

      if (pkg.rating >= 4.8) {
        score += 5;
        reasons.push("boasts exceptionally high feedback ratings from other guests");
      }

      const matchReason = reasons.length > 0 
        ? `This trip is recommended because it ${reasons.join(" and ")}.` 
        : `An excellent adventure in ${pkg.location} matching classic explorer profiles.`;

      return {
        packageId: pkg._id?.toString() || "",
        matchScore: Math.min(score, 100),
        matchReason,
        package: pkg,
      };
    });

    return fallbacks.sort((a, b) => b.matchScore - a.matchScore);
  } catch (err) {
    console.error("Extremely unexpected fallback error:", err);
    return [];
  }
}

export const recommendationService = {
  getRecommendations,
};
