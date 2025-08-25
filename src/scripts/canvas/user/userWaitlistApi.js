// CANVAS MODULES
// REGISTER USER ON WAITLIST

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';

export async function userWaitlistApi() {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { userId };
        const url = setApiUrl('userWaitlist');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        // Check response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Get response
        return response.json();
    // Catch errors
    } catch (error) {
        console.error('Error registering user waitlist:', error);
        return false;
    }
}