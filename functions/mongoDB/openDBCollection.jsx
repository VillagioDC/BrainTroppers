// FUNCTION TO OPEN DB COLLECTION
const { MongoClient } = require("mongodb"); // npm install mongodb
require("dotenv").config(); // npm install dotenv

// Functions
const log = require("../utils/log.jsx");

/* PARAMETERS
    collectionName {string} - Name of the collection
    env.MONGODB_URI {string} - MongoDB connection string
    env.MONGODB_DATABASE_NAME {string} - Name of the database
    RETURN {Object} || null - { client: MongoClient, database: Database, collection: Collection } or null
*/

async function openDBCollection(collectionName) {

    // Handle input error
    if (!collectionName || typeof collectionName !== "string") {
        log("SERVER ERROR", "Invalid collection name @openDBCollection.");
        return null;
    }

    // MongoDB configuration
    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DATABASE_NAME;

    // Handle environment variables error
    if (!uri || !databaseName) {
        log("SERVER ERROR", "Missing MongoDB environment variables @openDBCollection.");
        return null;
    }

    try {
        // Connect to MongoDB
        const client = new MongoClient(uri);
        await client.connect();

        // Handle connection error
        if (!client) {
            log("SERVER ERROR", "Unable to connect to MongoDB service @openDBCollection.");
            return null;
        }   

        // Connect to database
        const database = client.db(databaseName);

        // Handle connection error
        if (!database) {
            log("SERVER ERROR", `Unable to connect to MongoDB database ${databaseName} @openDBCollection.`);
            return null;
        }

        // Connect to collection chat
        const collection = database.collection(collectionName);

        // Handle connection error
        if (!collection) {
            log("SERVER ERROR", `Unable to connect to MongoDB collection ${collectionName} @openDBCollection.`);
            return null;
        }

        // Construct database object
        const db = { client: client, database: database, collection: collection };

        // Return
        return db;
        
    } catch (error) {
        log("SERVER ERROR", "Unable to connect to MongoDB database @openDBCollection.", error);
        return null;
    }
}

module.exports = openDBCollection;