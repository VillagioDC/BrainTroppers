// CANVAS MODULES
// CREATE NEW MAP API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { getLocalStorageMap } from '../utils/mapLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Create map api
export async function renameMapApi(newTitle) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const { projectId } = getLocalStorageMap();
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
        // Check response
        if (!response.ok) {
            await checkSessionExpired(response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Get new map
        const newMap = await response.json();
        return newMap;
        // Catch errors
        } catch (error) {
            console.error('Error adding node:', error);
            return false;
    }
}