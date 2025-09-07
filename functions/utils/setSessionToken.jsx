// FUNCTION TO SET SESSION TOKEN
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');

/* PARAMETERS
  no input
  RETURN {datetime} - expires
*/

async function setSessionToken(userId, sessionToken) {

    // Check inputs
    if (!userId || !sessionToken) {
        return false;
    }

    // Update database
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { userId: userId },
                                     update: { $set: { sessionToken: sessionToken } } });
    if (!result || result.modifiedCount === 0) {
        return false;
    }
    
    // Return confirmation
    return true;

}

module.exports = setSessionToken;