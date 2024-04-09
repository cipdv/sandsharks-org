"use server";

import { MongoClient } from "mongodb";

let cachedDb = null;

export async function dbConnection() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    cachedDb = client.db(process.env.DB_NAME);
    return cachedDb;
  } catch (err) {
    console.error("Failed to connect to the database", err);
    throw err;
  }
}

//check to see if this post deltes itself...
// _id
// 66153e313e46d9d664d30982
// title
// "First post on the new website :)"
// message
// "Testing out the new website, getting it ready for Summer 2024!"
// date
// "2024-04-26"
// startTime
// "11:00"
// endTime
// "14:00"

// beginnerClinic
// Object

// replies
// Array (empty)
// createdAt
// 2024-04-09T13:10:09.369+00:00
// postedBy
// "Cip"
// courts
// "100-104"
