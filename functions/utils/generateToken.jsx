// FUNCTION TO CREATE TOKEN
// No dependencies

// Functions
// No functions

/* PARAMETERS
  no input
  RETURN {string} - Token of 16 characters
*/

function generateToken() {

    // Characters to choose from
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    // Generate token
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Return token
    return token;

}

module.exports = generateToken;