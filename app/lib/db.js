import { MongoClient } from 'mongodb';

let db;

export async function dbConnection() {
    if (db) {
        return db;
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    db = client.db('Sandsharks');

    return db;
}