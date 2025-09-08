// CANVAS MODULES
// UNLINK NODE API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Add new node api 
export async function unlinkNodeApi ({projectId, nodeIdFrom, nodeIdTo}) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        // Construct body
        const body = { userId, projectId, nodeIdFrom, nodeIdTo };
        const url = setApiUrl('unlinkNode');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        // Parse response
        const responseData = await response.json();
        // Check response
        if (!response.ok) {
            checkSessionExpired(responseData);
            return false;
        }
        // Get new map
        const updatedMap = responseData;
        return updatedMap;
        
        // Catch errors
        } catch (error) {
            console.error('Error updating link:', error);
            return false;
    }
}