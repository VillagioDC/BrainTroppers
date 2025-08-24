// EMAIL VALIDATION MODULE

// Normalize email
export function normalizeEmail(input) {
    return input.trim().toLowerCase();
}

// Validate email
export function validateEmail(email) {
    if (email.length > 254) return false;
    const dangerousChars = /['";<>\(\)]/;
    if (dangerousChars.test(email)) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) return false;
    return true;
}
