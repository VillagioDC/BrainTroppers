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

async function userSignUp(credentials) {

    // Check credentials
    if (!credentials || !credentials.email || !credentials.password) {
        log('SERVER WARNING', 'Missing credentials @userSignUp', credentials);
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
    if (user) {
        log('SERVER INFO', 'User already exists', credentials.email);
        return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User already exists' })
        };
    }

    // Generate user ID
    const userId = generateToken();
    // Temp name
    const tempName = credentials.email.split('@')[0];
    // Generate user icon
    const icon = generateUserIcon();
    // Generate session token
    const authToken = generateToken();
    // Set expires
    const expires = setSessionExpires(userId);
    // Construct new user
    const newUser = {
        userId: userId,
        email: credentials.email,
        password: credentials.password,
        authToken: authToken,
        name: tempName,
        icon: icon,
        plan: "Free Plan",
        waitlist: false,
        proPlanTrial: null,
        maps: [],
        sessionToken: "",
        expires: expires
    }

    // Insert new user on MongoDB
    const result = await executeDB({ collectionName: 'users',
                                     type: 'insertOne',
                                     document: newUser });
    // Check insert error
    if (!result) {
        log('SERVER ERROR', 'Unable to sign up user @userSignUp.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to sign up user' })
        };
    }

    // Return
    return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Signed up successfully' })
    };
}

module.exports = userSignUp;