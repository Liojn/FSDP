const express = require('express');
const { connectToDatabase, closeDatabaseConnection } = require('./dbConfig'); // Import dbConfig
const bodyParser = require("body-parser");

const app = express();
const port = 3000; //PORT NUMBER

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Start server, connect to MongoDB
app.listen(port, async () => {
    try {
        await connectToDatabase(); // Connect to MongoDB
        console.log(`Server listening on port ${port}`);   
    } catch (err) {
        console.log("Error starting the server:", err);
        process.exit(1); // Exit the process if connection fails
    }
});

//Handle server shutdown gracefully
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await closeDatabaseConnection(); //Close MongoDB connection
    process.exit(0);
});