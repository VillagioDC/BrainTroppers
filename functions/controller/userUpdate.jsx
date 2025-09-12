// FUNCTION TO UPDATE ENTIRE USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string, object} - user
    RETURN {object} - user
*/

async function userUpdate(userId, user) {

    // Check input
    if (!userId || typeof userId !== 'string' ||
        !user || typeof user !== 'object' ||
        !user.userId || typeof user.userId !== 'string' || user.userId !== userId) {
        log("ERROR", "Invalid input @updateUser.");
        return null;
    }

    // Reconstruct user schema
    let userRecord = await executeDB({ collectionName: 'users',
                                       type: 'findOne',
                                       filter: { userId: userId } });

    // Reconstruct user object                                       
    let updatedUser = {
        userId: user.userId,
        email: user.email,
        password: user.password || userRecord.password,
        authToken: userRecord.authToken,
        name: user.name || userRecord.name,
        icon: user.icon || userRecord.icon,
        plan: user.plan || userRecord.plan,
        waitlist: user.waitlist || userRecord.waitlist,
        proPlanTrial: user.proPlanTrial || userRecord.proPlanTrial,
        maps: user.maps || userRecord.maps,
        theme: user.theme || userRecord.theme,
        sessionToken: user.sessionToken || userRecord.sessionToken,
        expires: user.expires || userRecord.expires
    }

    
    // Update entire user on database
    const result = await executeDB({ collectionName: 'users',
                                     type: 'replaceOne',
                                     filter: { userId: user.userId }, 
                                     replacement: { ...updatedUser } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to update user @updateUser.");
    }

    // Remove authToken
    delete updatedUser.authToken;

    // Return
    return updatedUser;

}

module.exports = userUpdate;