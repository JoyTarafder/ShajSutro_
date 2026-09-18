import mongoose, { Connection } from "mongoose";
import dns from "dns";

// Fallback DNS for MongoDB Atlas SRV resolution (only in local environments)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (error) {
    console.warn("⚠️ Warning: Failed to set custom DNS servers:", error);
  }
}

export let secondaryConnection: Connection | null = null;

let cachedPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {
  // 1. If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // 2. If a connection is already in-flight, reuse that exact promise
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
      }

      // 1. Connect to Primary Database with high-performance pooling
      const conn = await mongoose.connect(uri, {
        dbName: "shajsutro",
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000, // Fail fast if network is down
        socketTimeoutMS: 45000,
        family: 4, // Prefer IPv4 to avoid DNS delay
      });

      console.log(`✓ Primary MongoDB connected: ${conn.connection.host}`);

      // 2. Connect to Secondary Backup Database non-blockingly (does not block primary API)
      const secondaryUri = process.env.MONGODB_SECONDARY_URI;
      if (secondaryUri && !secondaryConnection) {
        setTimeout(() => {
          try {
            secondaryConnection = mongoose.createConnection(secondaryUri, {
              dbName: "shajsutro",
              maxPoolSize: 5,
              serverSelectionTimeoutMS: 5000,
            });
            secondaryConnection.asPromise()
              .then(() => {
                console.log(`✓ Secondary Backup MongoDB connected: ${secondaryConnection?.host}`);
                console.log(`⚡ Real-time Dual-DB Sync Enabled (Primary ↔ Secondary)`);
              })
              .catch((secErr: any) => {
                console.warn("⚠️ Warning: Failed to connect Secondary MongoDB:", secErr.message);
              });
          } catch (secInitErr: any) {
            console.warn("⚠️ Warning: Secondary MongoDB init failed:", secInitErr.message);
          }
        }, 0);
      }
    } catch (error: any) {
      cachedPromise = null; // Reset on failure so next request can retry
      console.error("✗ Primary MongoDB connection failed:", error?.message || error);
      throw error;
    }
  })();

  return cachedPromise;
};

export default connectDB;
