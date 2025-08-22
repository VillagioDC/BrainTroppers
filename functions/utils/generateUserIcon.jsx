// FUNCTION TO GENERATE USER ICON
// No dependencies

// Functions
// No functions

/* PARAMETERS
  input {string} - email
  RETURN {string} - user icon
*/

function generateUserIcon(email) {
    // Validate input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return '';
    }

    // Generate user icon
    let userIcon = '';
    const atIndex = email.indexOf('@');
    const beforeAt = email.substring(0, atIndex);
    
    // Check if there's a dot before @
    const dotIndex = beforeAt.indexOf('.');
    
    if (dotIndex !== -1 && dotIndex < atIndex) {
        // Case a: Use first letter and letter after dot
        userIcon = email[0] + email[dotIndex + 1];
    } else if (beforeAt.length >= 2) {
        // Case b: Use first two letters
        userIcon = beforeAt.substring(0, 2);
    } else {
        // Case c: Use first letter
        userIcon = email[0];
    }
    
    // Return user icon in uppercase
    return userIcon.toUpperCase();
}

module.exports = generateUserIcon;