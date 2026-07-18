import { connectToDatabase, closeDatabaseConnection } from "../config/db";
import { authService } from "../modules/auth/auth.service";
import { userService } from "../modules/user/user.service";

async function seed() {
  try {
    console.log("Starting database seed...");
    await connectToDatabase();

    const travelerEmail = "traveler@travelai.com";
    const existingTraveler = await userService.findByEmail(travelerEmail);
    if (!existingTraveler) {
      await authService.register("Demo Traveler", travelerEmail, "password123", "traveler");
      console.log(`Successfully seeded traveler: ${travelerEmail}`);
    } else {
      console.log(`Traveler ${travelerEmail} already exists`);
    }

    const adminEmail = "admin@travelai.com";
    const existingAdmin = await userService.findByEmail(adminEmail);
    if (!existingAdmin) {
      await authService.register("Demo Admin", adminEmail, "password123", "admin");
      console.log(`Successfully seeded admin: ${adminEmail}`);
    } else {
      console.log(`Admin ${adminEmail} already exists`);
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await closeDatabaseConnection();
  }
}

seed();
