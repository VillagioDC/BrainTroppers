// CANVAS MODULES
// CHECK UPDATE STATUS API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Create map api
export async function updateMapGetStatus(projectId) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Authorization': `Bearer ${sessionToken}`,
        };
        const query = `?projectId=${projectId}&userId=${userId}`;
        const url = setApiUrl('updateMapGetStatus') + query;
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        // Parse response
        const responseData = await response.json();
        // Check response
        if (!response.ok) {
            checkSessionExpired(responseData);
            return false;
        }
        // Get updated map
        const updatedMap = responseData;
        return updatedMap;
        
        // Catch errors
        } catch (error) {
            console.error('Error creating map:', error);
            return false;
    }
}