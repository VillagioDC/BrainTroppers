// LOAD USER SCHEMA
const fs = require('fs');
const path = require('path');

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    input () - none
    RETURN {object} - Return user schema or null
*/
async function loadUserSchema() {

    try {
        // File name
        const filename = path.join(__dirname, '../data/userSchema.json');

        // Load map schema
        const userStr = fs.readFileSync(filename, 'utf8');
        // Handle error
        if (!userStr) {
            log("SERVER ERROR", "Unable to read user schema @userSchema");
            return null;
        }

        // Parse map schema
        const userSchema = JSON.parse(userStr);

        // Return
        return userSchema;

    // Catch error
    } catch (error) {
        log("SERVER ERROR", "Unable to load user schema @userSchema", error);
        return null;
    }
}

// Export
module.exports = loadUserSchema;
