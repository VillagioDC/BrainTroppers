// FUNCTION TO SIGN UP USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const generateUserIcon = require('../utils/generateUserIcon.jsx');
const setExpires = require('../utils/setExpires.jsx')
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - credentials: {email, password}
    RETURN {object} - auth: {userId, email, name, icon, plan, maps[], sessionToken, expires} || null
*/

async function userSignUp(credentials) {

    // Check credentials
    if (!credentials || !credentials.email || !credentials.password) {
        log('SERVER WARNING', 'Missing credentials', credentials);
        return null;
    }
    // Check user
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: {email: credentials.email}
    });
    // Check user
    if (user) {
        log('SERVER WARNING', 'User already exists', credentials.email);
        return null;
    }

    // Generate user ID
    const userId = generateToken();
    // Temp name
    const tempName = credentials.email.split('@')[0];
    // Generate user icon
    const icon = generateUserIcon();
    // Generate session token
    const sessionToken = generateToken();
    // Set expires
    const expires = setExpires();
    // Construct new user
    const newUser = {
        userId: userId,
        email: credentials.email,
        password: credentials.password,
        name: tempName,
        icon: icon,
        plan: "Free plan",
        maps: [],
        sessionToken: sessionToken,
        expires: expires
    }

    // Insert new user on MongoDB
    await executeDB({ collectionName: 'users',
                      type: 'insertOne',
                      document: newUser });

    // Return
    return newUser;
}

module.exports = userSignUp;