const { ObjectId } = require('mongodb');
const  { connectToDatabase } = require('./dbConfig');


async function seedForestData() {
    try {
        const db  = await connectToDatabase();

        // Set the companyId as specified
        const companyId = new ObjectId("671cf9a6e994afba6c2f332d");

        // Define the start date and number of months
        const startDate = new Date("2022-10-26");
        const totalMonths = 25;
        const forestData = generateForestData(companyId, startDate, totalMonths);

        // Insert forest data into Forest collection
        await db.collection("Forest").insertMany(forestData);

        console.log("Forest data inserted successfully!");

    } catch (error) {
        console.error("Error seeding forest data:", error);
    } 
}

// Function to generate forest data with monthly intervals
function generateForestData(companyId, startDate, totalMonths) {
    const data = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < totalMonths; i++) {
        const totalAreaInHectares = parseFloat((Math.random() * 500 + 50).toFixed(2)); // 50 to 550 hectares

        data.push({
            _id: new ObjectId(),
            companyId: companyId,
            totalAreaInHectares: totalAreaInHectares,
            updatedAt: new Date(currentDate)
        });

        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return data;
}

seedForestData();
