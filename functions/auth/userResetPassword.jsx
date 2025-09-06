// FUNCTION TO SEND USER PASSWORD RESET EMAIL
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string} - query
    RETURN {object} - success || error
*/

async function userResetPassword(query) {

    // Check existing auth token
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: {authToken: query}
    });
    // Handle error
    if (!user) {
        log('SERVER WARNING', 'Token not found', query);
        return {
            statusCode: 404,
            body: JSON.stringify({error: 'Bad request'})
        };
    }

    // Generate new auth token
    const authToken = generateToken();

    // Update reset token
    const userUpdate = await executeDB({ collectionName: 'users',
                                          type: 'updateOne',
                                          filter: {email: user.email},
                                          update: {$set: {authToken: authToken,
                                                          expires: null}}})
    // Handle error
    if (!userUpdate || userUpdate.modifiedCount === 0) {
        log('SERVER ERROR', 'Unable to update user', user.userId);
        return {
            statusCode: 500,
            body: JSON.stringify({error: 'Internal server error'})
        };
    }

    // Return
    return {
        statusCode: 200,
        body: {success: 'Password reset successful', authToken: authToken }
    };

}

module.exports = userResetPassword;