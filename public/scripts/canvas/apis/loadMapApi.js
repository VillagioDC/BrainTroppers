// CANVAS MODULES
// LOAD MAP API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Load map from database
export async function loadMapApi(projectId) {
    try {
        // Set parameters
        const { userId, token } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        const body = { userId, projectId };
        const url = setApiUrl('loadMap');
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
        // Get updated node
        const map = responseData;
        return map;
        
    // Catch errors
    } catch (error) {
        console.error('Error loading map:', error);
        return false;
    }
}
