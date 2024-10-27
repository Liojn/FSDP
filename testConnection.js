const { connectToDatabase } = require('./dbConfig'); // Adjust the path

async function testConnection() {
    try {
        const db = await connectToDatabase();
        console.log("Connected to the database:", db.databaseName);
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

testConnection();
