// LANDING PAGE AUTHENTICATION MODULE
// AUTH NEW PASSWORD API MODULE

// Import modules
import { setApiUrl } from './setApiUrl.js';

// API call to new password
export async function apiNewPassword(email, password, authToken) {
    try {
        // Set Parameters
        const headers = { 'Content-Type': 'application/json' };
        const body = { credentials: { email, password } };
        const url = setApiUrl('newPassword');
        // API call
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ ...body, authToken }) });
        // Handle response
        if (!response.ok) throw new Error(await response.text());
        // Return response
        return await response.json();
    // Catch error
    } catch (error) {
        throw new Error('Password update error:', error);
    }
}