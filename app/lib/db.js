import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI;
const options = {};

if (!URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let client = new MongoClient(URI, options);
let dbConnection;

if (process.env.NODE_ENV !== "production") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  dbConnection = global._mongoClientPromise;
} else {
  dbConnection = client.connect();
}

export default dbConnection;
// "use server";

// import { MongoClient } from "mongodb";

// let cachedDb = null;

// export async function dbConnection() {
//   if (cachedDb) {
//     return cachedDb;
//   }

//   try {
//     const client = await MongoClient.connect(process.env.MONGODB_URI);
//     cachedDb = client.db(process.env.DB_NAME);
//     return cachedDb;
//   } catch (err) {
//     console.error("Failed to connect to the database", err);
//     throw err;
//   }
// }
