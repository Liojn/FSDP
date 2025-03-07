
import dotenv from 'dotenv';
dotenv.config(); //Load env var from .env file
import { MongoClient } from 'mongodb';

//MongoDB Atlas connect
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@fullstackdev.kb2qe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

//Create client instance as a 'user'
const client = new MongoClient(url);

let connectedClient;

async function connectToDatabase() {
    if (connectedClient) {
        return connectedClient.db(process.env.DB_NAME);
    }
    try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas');

    connectedClient = client;

    return connectedClient.db(process.env.DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

// Function to close the database connection
async function closeDatabaseConnection() {
    try {
        await connectedClient?.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error closing database connection:", err);
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default 
{ connectToDatabase,
  closeDatabaseConnection };
