// FUNCTION TO AUTENTICATE USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const setSessionToken = require('../utils/setSessionToken.jsx');
const setSessionExpires = require('../utils/setExpires.jsx')
const userRefresh = require('../controller/userRefresh.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - credentials: {email, password}
    RETURN {object} - auth: {userId, email, name, icon, plan, maps[], sessionToken, expires} || { statusCode, body}
*/

async function userSignIn(credentials) {
    // Check credentials
    if (!credentials || !credentials.email || !credentials.password) {
        log("WARNING", 'Missing credentials @userSignIn', credentials);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing credentials' })
        }
    }
    // Check user
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: {email: credentials.email}
    });
    // Check user
    if (!user) {
        log("INFO", 'User not found @userSignIn', credentials.email);
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
        }
    }
    // Check confirmation pending
    if (user.authToken !== null) {
        log("INFO", 'User not confirmed @userSignIn', credentials.email);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Verify your email' })
        }
    }
    // Check password
    if (user.password !== credentials.password) {
        log("INFO", 'Incorrect password @userSignIn', credentials.email);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Incorrect password' })
        }
    }
    // Generate session token
    const sessionToken = generateToken();
    await setSessionToken(user.userId, sessionToken);
    // Set expires
    const expires = await setSessionExpires(user.userId);
    // Refresh user data
    const refresh = await userRefresh(user.userId);

    // Construct authorization
    const auth = {
        userId: user.userId,
        email: user.email,
        // authToken: not passed
        name: user.name,
        icon: user.icon,
        plan: user.plan,
        waitlist: user.waitlist,
        proPlanTrial: user.proPlanTrial,
        maps: refresh.maps || user.maps,
        theme: user.theme,
        sessionToken: sessionToken,
        expires: expires
    }

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Sign in success', auth})
    }
}

module.exports = userSignIn;