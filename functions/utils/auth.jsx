// FUNCTION TO AUTHENTICATE USER REQUEST
// Handle authentication

// Dependencies
const jwt = require('jsonwebtoken');

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    input {string} - Jwt token
    RETURN {object || null} - decoded: {userId, email} or null
*/

function verifyJwt(token) {
    // Check request
    if (!token) {
        log('SERVER WARNING', 'Missing token', token);
        return null;
    }
    // Verify token
    try {
        // Verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Check decoded
        if (!decoded || !decoded.userId || !decoded.email) {
            log('SERVER WARNING', 'Invalid token');
            return null;
        }
        // Return
        return decoded;

        // Catch error
    } catch (error) {
        log('SERVER ERROR', 'Unable to verify token @verifyJwt', error);
        return null;
    }
}

module.exports = verifyJwt;