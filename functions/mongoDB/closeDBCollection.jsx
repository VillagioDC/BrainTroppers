// FUNCTION TO CLOSE MONGODB COLLECTION
const { MongoClient } = require("mongodb"); // npm install mongodb

// Functions
const log = require("../utils/log.jsx");

/* PARAMETERS
    db {Object} - { client: MongoClient }
    RETURN {boolean} - operation success true or false
*/

async function closeDBCollection(db) {

    // Handle input error
    if (!db || !db.client || !(db.client instanceof MongoClient)) {
        log("ERROR", "Wrong input to close MongoDB connection @closeDBCollection.");
        return false;
    }

    try {
        // Disconnect from MongoDB
        await db.client.close();
        
        // Return
        return true;

    // Catch error
    } catch (error) {
        log("ERROR", "Unable to close MongoDB connection @closeDBCollection.", error);
    }
}

module.exports = closeDBCollection;