// lib/mongodb.ts - COMPLETE PRODUCTION READY
import { MongoClient, MongoClientOptions } from "mongodb";

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "test";

// Validate environment variable
if (!MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '❌ MONGODB_URI is missing in production environment.\n' +
      '💡 Please add it to your deployment platform environment variables:\n' +
      '1. For Vercel: Project Settings → Environment Variables\n' +
      '2. Key: MONGODB_URI\n' +
      '3. Value: mongodb+srv://username:password@cluster.mongodb.net/dbname'
    );
  } else {
    // Development fallback
    console.warn('⚠️ MONGODB_URI not found. Using local MongoDB for development.');
  }
}

// Use environment variable or local fallback
const uri = MONGODB_URI || "mongodb://127.0.0.1:27017";

// MongoDB connection options
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// TypeScript global declaration
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use global variable for Hot Module Replacement
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log("✅ MongoDB connected successfully!");
        console.log(`📊 Database: ${MONGODB_DB}`);
        console.log(`🌐 Using: ${MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB'}`);
        return connectedClient;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        console.log("\n🔧 Troubleshooting Tips:");
        if (MONGODB_URI) {
          console.log("1. Check your MongoDB Atlas credentials");
          console.log("2. Verify Network Access is set to 0.0.0.0/0");
          console.log("3. Wait 2-3 minutes after changing Atlas settings");
        } else {
          console.log("1. Install MongoDB locally or use MongoDB Atlas");
          console.log("2. For local: brew services start mongodb-community (Mac)");
          console.log("3. For Atlas: Get free cluster at https://cloud.mongodb.com");
        }
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log("✅ MongoDB Atlas connected in production");
      return connectedClient;
    })
    .catch((error) => {
      console.error("❌ Production MongoDB connection failed");
      console.error("Error:", error.message);
      throw error;
    });
}

// Export the connection promise
export default clientPromise;

// Helper function to get database instance
export async function getDatabase(dbName?: string) {
  try {
    const client = await clientPromise;
    return client.db(dbName || MONGODB_DB);
  } catch (error) {
    console.error("Failed to get database:", error);
    throw error;
  }
}

// Helper function to get collection
export async function getCollection(collectionName: string, dbName?: string) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

// Helper function to check connection status
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    return {
      connected: true,
      message: "MongoDB is connected and responsive",
      database: MONGODB_DB,
      type: MONGODB_URI ? "Atlas" : "Local"
    };
  } catch (error: any) {
    return {
      connected: false,
      message: error.message || "Connection failed",
      database: MONGODB_DB,
      type: MONGODB_URI ? "Atlas" : "Local"
    };
  }
}