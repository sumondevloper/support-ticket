import { MongoClient, MongoClientOptions } from "mongodb";

console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  console.error('Please add MONGODB_URI to your .env.local file');
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using development fallback MongoDB URI');
  } else {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
}

const uri = MONGODB_URI as string;

const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    try {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().then((client) => {
        console.log("✅ MongoDB connected successfully");
        return client;
      }).catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
      });
    } catch (error) {
      console.error("❌ Failed to create MongoClient:", error);
      throw error;
    }
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;