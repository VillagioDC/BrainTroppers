// CANVAS MODULES
// CREATE NEW MAP API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Create map api
export async function renameMapApi(newTitle) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const { projectId } = JSON.parse(braintroop.map.projectId());
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { userId, projectId, newTitle };
        const url = setApiUrl('renameMap');
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
            console.error('Error adding node:', error);
            return false;
    }
}