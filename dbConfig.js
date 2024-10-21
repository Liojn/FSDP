
require('dotenv').config(); //Load env var from .env file
const { MongoClient } = require('mongodb');

//MongoDB Atlas connect
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@fullstackdev.kb2qe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

//Create client instance as a 'user'
const client = new MongoClient(url);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas');
    return client.db(process.env.DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

// Function to close the database connection
async function closeDatabaseConnection() {
    try {
        await client.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error closing database connection:", err);
    }
}

module.exports = 
{ connectToDatabase,
  closeDatabaseConnection };
