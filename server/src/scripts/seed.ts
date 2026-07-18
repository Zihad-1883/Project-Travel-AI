import { connectToDatabase, closeDatabaseConnection } from "../config/db";
import { authService } from "../modules/auth/auth.service";
import { userService } from "../modules/user/user.service";
import { Package } from "../modules/packages/packages.types";
import { ObjectId } from "mongodb";

async function seed() {
  try {
    console.log("Starting database seed...");
    const db = await connectToDatabase();

    // 1. Seed Demo Traveler
    const travelerEmail = "traveler@travelai.com";
    let traveler = await userService.findByEmail(travelerEmail);
    if (!traveler) {
      traveler = await authService.register("Demo Traveler", travelerEmail, "password123", "traveler");
      console.log(`Successfully seeded traveler: ${travelerEmail}`);
    } else {
      console.log(`Traveler ${travelerEmail} already exists`);
    }

    // 2. Seed Demo Admin
    const adminEmail = "admin@travelai.com";
    let admin = await userService.findByEmail(adminEmail);
    if (!admin) {
      admin = await authService.register("Demo Admin", adminEmail, "password123", "admin");
      console.log(`Successfully seeded admin: ${adminEmail}`);
    } else {
      console.log(`Admin ${adminEmail} already exists`);
    }

    // 3. Seed Travel Packages
    console.log("Clearing existing travel packages...");
    await db.collection("packages").deleteMany({});

    const adminId = admin._id as ObjectId;

    const dummyPackages: Omit<Package, "_id" | "createdAt">[] = [
      {
        title: "Tropical Paradise Getaway",
        shortDescription: "Experience the ultimate beach vacation with tropical luxury, volcanic mountains, and historic temples.",
        fullDescription: "A gorgeous journey through the heart of Bali. Rest in beachside villas, hike the majestic Mount Batur at sunrise, and explore traditional arts in Ubud. Packages include luxury boutique accommodation, selected meals, resort transfers, and guided cultural tours.",
        price: 1200,
        duration: "7 Days / 6 Nights",
        location: "Bali, Indonesia",
        images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"],
        rating: 4.8,
        ownerAdminId: adminId
      },
      {
        title: "Alpine Ski & Wellness Retreat",
        shortDescription: "Ski on powdery alpine slopes with direct Matterhorn views and relax in premium boutique thermal spas.",
        fullDescription: "Zermatt is the perfect snow adventure. Travel via the Glacier Express, stay in a cozy 5-star ski chalet, and ski down world-famous slopes. Conclude each day at the luxury mineral bath spa. Complete rentals, lift tickets, chalet dinners, and wellness passes are fully customized and included.",
        price: 2450,
        duration: "5 Days / 4 Nights",
        location: "Zermatt, Switzerland",
        images: ["https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80"],
        rating: 4.9,
        ownerAdminId: adminId
      },
      {
        title: "Cultural Wonders of Kyoto",
        shortDescription: "Immerse yourself in historic temples, bamboo forests, traditional tea ceremonies, and gorgeous seasonal gardens.",
        fullDescription: "Kyoto captures Japan's historical soul. Walk through the golden Kinkaku-ji temple and Arashiyama's ancient bamboo groves. This package includes high-speed Shinkansen transit, stays at a authentic Ryokan, premium private guided walks, multi-course Kaiseki dinners, and an immersive tea ceremony experience.",
        price: 1850,
        duration: "6 Days / 5 Nights",
        location: "Kyoto, Japan",
        images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"],
        rating: 4.7,
        ownerAdminId: adminId
      },
      {
        title: "Wildlife Safari Adventure",
        shortDescription: "Observe the majestic African Big Five in their natural habitats with elite guided game wilderness drives.",
        fullDescription: "Immerse in the wild Serengeti plains. Sleep in premium luxury safari lodges under the starry African sky. Watch the Great Migration, enjoy private daily game drives with expert wildlife trackers, and witness the lions, elephants, and leopards in their wilderness. All dining, park fees, and local expert trackers are included.",
        price: 3200,
        duration: "8 Days / 7 Nights",
        location: "Serengeti, Tanzania",
        images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80"],
        rating: 4.95,
        ownerAdminId: adminId
      },
      {
        title: "Ancient Pharaohs & Nile Voyage",
        shortDescription: "Explore the Pyramids of Giza, the Great Sphinx, and sail down the Nile in a traditional felucca.",
        fullDescription: "Walk in the footsteps of Pharaohs. This package includes a private Egyptologist guide for the Pyramids of Giza and the Grand Egyptian Museum, fine dining at local premium restaurants, resort hotel lodging, and a golden sunset sail on the Nile river.",
        price: 1100,
        duration: "5 Days / 4 Nights",
        location: "Cairo, Egypt",
        images: ["https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"],
        rating: 4.6,
        ownerAdminId: adminId
      },
      {
        title: "Coastal Mediterranean Escape",
        shortDescription: "Cruise past cliffside pastel towns, enjoy freshly caught seafood, and explore Capri's Blue Grotto.",
        fullDescription: "A gorgeous luxury cruise of Italy’s scenic southern coastline. Visit Positano, Ravello, and Sorrento. Includes private yacht charters, stays in cliffside suites overlooking the sparkling turquoise sea, guided historic tours, and authentic Neapolitan cooking masterclasses.",
        price: 2100,
        duration: "7 Days / 6 Nights",
        location: "Amalfi Coast, Italy",
        images: ["https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"],
        rating: 4.85,
        ownerAdminId: adminId
      }
    ];

    const packageCollection = db.collection("packages");
    for (const pkg of dummyPackages) {
      await packageCollection.insertOne({
        ...pkg,
        createdAt: new Date()
      });
    }

    console.log(`Seeded ${dummyPackages.length} travel packages owned by ${adminEmail}`);
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await closeDatabaseConnection();
  }
}

seed();
