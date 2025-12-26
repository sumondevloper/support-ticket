import { MongoClient, MongoClientOptions } from "mongodb";

const MONGODB_URI = "mongodb+srv://sumonchakraborty414_db_user:TIw6mo4vWtujjZa1@cluster0.6liakct.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
const MONGODB_DB = process.env.MONGODB_DB || "test";

if (!MONGODB_URI) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("❌ MONGODB_URI is missing in production environment.");
  } else {
    console.warn("⚠️ MONGODB_URI not found. Using local MongoDB for development.");
  }
}

const uri = MONGODB_URI || "mongodb://127.0.0.1:27017";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
