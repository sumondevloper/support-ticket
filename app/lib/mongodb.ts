import { MongoClient } from "mongodb";

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;

if (!username || !password) {
  throw new Error("Missing MongoDB credentials in environment variables");
}

const uri = `mongodb+srv://${username}:${password}@cluster0.6liakct.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect().then((client) => {
      console.log("✅ MongoDB connected");
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
