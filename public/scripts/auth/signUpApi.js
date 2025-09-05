// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN UP API MODULE

// Import modules
import { setApiUrl } from './setApiUrl.js';

// API call to sign up
export async function apiSignUp(email, password) {
    try {
        // Set Parameters
        const headers = { 'Content-Type': 'application/json' };
        const body = { credentials: { email, password } };
        const url = setApiUrl('signUp');
        // API call
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        // Handle response
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    // Catch error
    } catch (error) {
        throw new Error('Sign-up error:', error);
    }
}