// FUNCTION TO SIGN UP USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const generateUserIcon = require('../utils/generateUserIcon.jsx');
const setSessionExpires = require('../utils/setExpires.jsx')
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - credentials: {email, password}
    RETURN {object} - message: success || error
*/

async function userNewPassword(credentials) {

    // Check credentials
    if (!credentials || !credentials.email || !credentials.password || !credentials.authToken) {
        log('SERVER WARNING', 'Missing credentials', credentials);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing credentials' })
        };
    }
    // Check user
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: {email: credentials.email}
    });
    // Check user
    if (!user) {
        log('SERVER WARNING', 'User not found', credentials.email);
        return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User not found' })
        };
    }
    // Check auth Token
    if (!user.authToken || user.authToken !== authToken) {
        log('SERVER WARNING', 'Unauthorized new password request', credentials.email);
        return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    // Insert update user password on MongoDB
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: {email: credentials.email},
                                     update: {$set: {password: credentials.password,
                                                     authToken: null }}});
    // Check insert error
    if (!result) {
        log('SERVER ERROR', 'Unable to update user password @userNewPassword.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Password update error' })
        };
    }

    // Return
    return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Password updated' })
    };
}

module.exports = userNewPassword;