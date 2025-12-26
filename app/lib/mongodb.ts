// lib/mongodb.ts - FIXED VERSION
import { MongoClient, MongoClientOptions } from "mongodb";

// Development fallback URI
const DEVELOPMENT_URI = "mongodb://127.0.0.1:27017";
const DEFAULT_DB = "test";

// Get URI with proper fallback
const MONGODB_URI = process.env.MONGODB_URI || DEVELOPMENT_URI;

console.log(`📡 MongoDB Connection Info:
  • URI Set: ${!!process.env.MONGODB_URI}
  • Using: ${MONGODB_URI === DEVELOPMENT_URI ? "Local MongoDB" : "Remote MongoDB"}
  • NODE_ENV: ${process.env.NODE_ENV}
`);

// Validate URI (only if not using default)
if (MONGODB_URI !== DEVELOPMENT_URI && !MONGODB_URI.startsWith('mongodb')) {
  console.error('❌ Invalid MongoDB URI format');
  console.error('URI should start with mongodb:// or mongodb+srv://');
  throw new Error('Invalid MongoDB URI format');
}

const options: MongoClientOptions = {
  // Connection options
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Development mode with global caching
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log("🔄 Creating new MongoDB connection for development...");
    
    try {
      client = new MongoClient(MONGODB_URI, options);
      
      global._mongoClientPromise = client.connect()
        .then((connectedClient) => {
          console.log("✅ MongoDB connected successfully!");
          
          // Test connection
          return connectedClient.db().admin().ping()
            .then(() => {
              console.log("✅ MongoDB ping successful");
              return connectedClient;
            })
            .catch((pingError) => {
              console.error("❌ MongoDB ping failed:", pingError.message);
              console.log("💡 Tips:");
              console.log("1. Check if MongoDB is running locally");
              console.log("2. Run: brew services start mongodb-community (Mac)");
              console.log("3. Or: sudo systemctl start mongod (Linux)");
              console.log("4. Or install MongoDB from: https://www.mongodb.com/try/download/community");
              throw pingError;
            });
        })
        .catch((error) => {
          console.error("❌ MongoDB connection failed!");
          console.error("Error:", error.message);
          
          if (MONGODB_URI === DEVELOPMENT_URI) {
            console.log("\n🔧 Local MongoDB Setup Instructions:");
            console.log("1. Install MongoDB Community Edition");
            console.log("2. Start MongoDB service:");
            console.log("   • Mac: brew services start mongodb-community");
            console.log("   • Ubuntu: sudo systemctl start mongod");
            console.log("   • Windows: Run 'mongod' from Command Prompt as Administrator");
            console.log("\n3. Or use MongoDB Atlas (Cloud):");
            console.log("   • Go to https://cloud.mongodb.com");
            console.log("   • Create a free cluster");
            console.log("   • Get connection string");
            console.log("   • Add to .env.local: MONGODB_URI=your_connection_string");
          }
          
          throw error;
        });
    } catch (error: any) {
      console.error("❌ Failed to create MongoClient:", error.message);
      throw error;
    }
  }
  clientPromise = global._mongoClientPromise;
} 
// Production mode - fresh connection
else {
  console.log("🚀 Creating MongoDB connection for production...");
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

// Helper function to get database
export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName || DEFAULT_DB);
}

// Helper function to check connection
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    return { connected: true, message: "MongoDB is connected" };
  } catch (error: any) {
    return { connected: false, message: error.message };
  }
}

export default clientPromise;