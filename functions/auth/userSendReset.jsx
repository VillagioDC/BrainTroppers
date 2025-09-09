// FUNCTION TO SEND USER PASSWORD RESET EMAIL
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string} - email
    RETURN {object} - success || error
*/

async function userSendReset(email) {

    // Check existing user
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: {email: email}
    });
    // Handle error
    if (!user) {
        log("WARNING", 'User not found @userSendReset', email);
        return {
            statusCode: 404,
            body: JSON.stringify({error: 'User not found'})
        };
    }

    // Generate reset token
    const resetToken = generateToken();
    // Set token expire
    const tokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update reset token
    const userUpdate = await executeDB({ collectionName: 'users',
                                          type: 'updateOne',
                                          filter: {email: email},
                                          update: {$set: {authToken: resetToken,
                                                          sessionToken: null,
                                                          expires: tokenExpire}}})
    // Handle error
    if (!userUpdate || userUpdate.modifiedCount === 0) {
        log("ERROR", 'Unable to update user @userSendReset', email);
        return {
            statusCode: 500,
            body: JSON.stringify({error: 'Internal server error'})
        };
    }

    // Send reset email
    // Implement

    // Return
    return {
        statusCode: 200,
        body: JSON.stringify({success: 'Reset email sent'})
    };

}

module.exports = userSendReset;