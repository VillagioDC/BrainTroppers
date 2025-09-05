// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN IN API MODULE

// Import modules
import { setApiUrl } from './setApiUrl.js';

// API call to sign in
export async function apiSignIn(email, password) {
    try {
        // Set Parameters
        const headers = { 'Content-Type': 'application/json' };
        const body = { credentials: { email, password } };
        const url = setApiUrl('signIn');
        // API call
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        // Handle response
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    // Catch error
    } catch (error) {
        throw new Error('Sign-in error:', error);
    }
}
