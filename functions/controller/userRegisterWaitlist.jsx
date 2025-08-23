// FUNCTION TO UPDATE LAST CHANGE ON USER PROJECTS
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string} - userId
    RETURN {object} - modified count || false
*/

async function userRegisterWaitlist(userId) {

    // Register user at waitlist and allow trial access

    // Set expiration of trial
    const expiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update user
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { userId: userId },
                                     update: { $set: { waitlist: true,
                                                       proPlanTrial: expiration} } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update last change on user @userRegisterWaitlist.");
        return null;
    }

    // Return
    return result;
}

module.exports = userRegisterWaitlist;