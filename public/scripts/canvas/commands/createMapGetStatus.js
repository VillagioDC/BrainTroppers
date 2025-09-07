// CANVAS MODULES
// HECK CREATION STATUS API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Create map api
export async function createMapGetStatus(projectId) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Authorization': `Bearer ${sessionToken}`,
        };
        const query = `?projectId=${projectId}&userId=${userId}`;
        const url = setApiUrl('createMapGetStatus') + query;
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
        // Get new map
        const newMap = responseData;
        return newMap;
        
        // Catch errors
        } catch (error) {
            console.error('Error creating map:', error);
            return false;
    }
}