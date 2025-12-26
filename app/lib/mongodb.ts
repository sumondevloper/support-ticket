// lib/mongodb.ts - COMPLETE WORKING VERSION
import { MongoClient, MongoClientOptions } from "mongodb";

// তোমার Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '❌ MONGODB_URI is missing in production! ' +
      'Add it to Vercel Environment Variables: ' +
      'mongodb+srv://sumonchakraborty414_db_user:TIw6mo4vWtujjZa1@cluster0.6liakct.mongodb.net/test'
    );
  } else {
    console.warn('⚠️ MONGODB_URI not found. Using local MongoDB for development.');
  }
}

// Use Atlas URI or local fallback
const uri = MONGODB_URI || "mongodb://127.0.0.1:27017";

// Connection options
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// For TypeScript global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    
    // Log connection status
    global._mongoClientPromise
      .then(() => {
        console.log("✅ MongoDB connected successfully!");
        console.log(`🔗 Using: ${MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB'}`);
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        if (MONGODB_URI) {
          console.log("💡 Tips for MongoDB Atlas:");
          console.log("1. Check your username/password");
          console.log("2. Go to Atlas → Network Access → Add 0.0.0.0/0");
          console.log("3. Wait 2 minutes after changing settings");
        } else {
          console.log("💡 Tips for Local MongoDB:");
          console.log("1. Install MongoDB Community Edition");
          console.log("2. Start MongoDB service");
          console.log("3. Or use MongoDB Atlas cloud database");
        }
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  
  // Production connection logging
  clientPromise
    .then(() => console.log("✅ MongoDB Atlas connected in production"))
    .catch((error) => {
      console.error("❌ Production MongoDB connection failed:", error.message);
      console.error("🔗 Connection string used:", uri.substring(0, 30) + "...");
    });
}

// Export the Promise
export default clientPromise;

// Helper function to get database
export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  const db = client.db(dbName || process.env.MONGODB_DB || "test");
  return db;
}

// Helper function to check connection
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    return { 
      connected: true, 
      message: "MongoDB is connected",
      type: MONGODB_URI ? "Atlas" : "Local"
    };
  } catch (error: any) {
    return { 
      connected: false, 
      message: error.message,
      type: MONGODB_URI ? "Atlas" : "Local"
    };
  }
}

// Helper function to get collection
export async function getCollection(collectionName: string, dbName?: string) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}