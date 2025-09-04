// CANVAS MODULES
// ASSIGN MAP TO USER API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Assign map to user API
export async function assignMapToUserApi({ map, assignedUserId }) {
    try {
        // Set parameters
        const { sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { assignedUserId, map };
        const url = setApiUrl('assignMapToUser');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        // Parse response
        const responseData = await response.json();

        // Check response
        if (!response.ok) {
            if (response.status === 401) {
                checkSessionExpired(responseData);
                return { error: 'Session expired' };
            }
            return { error: responseData.error || 'Failed to assign map' };
        }

        // Return updated user
        return responseData;

    } catch (error) {
        console.error('Error assigning map to user:', error);
        return { error: 'Internal error' };
    }
}