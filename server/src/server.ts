import app from "./app";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB database...");
    await connectToDatabase();
    
    app.listen(env.PORT, () => {
      console.log(`Server is listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("Initialization failed:", error);
    process.exit(1);
  }
};

startServer();
