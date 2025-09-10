// FUNCTION TO READ USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - projectID
    RETURN {object} - map || null
*/

async function userRead(userId) {

    // Find document on database
    const result = await executeDB({ collectionName: 'users',
                                     type: 'findOne',
                                     filter: { userId: userId  } });
    // Handle error
    if (!result || !result.userId || result.userId !== userId) {
        log("ERROR", "Unable to read user @userRead", userId);
        return null;
    }

    // Return
    const user = result;
    return user;

}

module.exports = userRead;