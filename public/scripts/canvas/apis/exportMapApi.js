// CANVAS MODULES
// LOAD MAP API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Load map from database
export async function exportMapApi({projectId, type}) {
    try {
        // Set parameters
        const { userId, token } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        const body = { userId, projectId, type };
        const url = setApiUrl('exportMap');
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
        // Get download url
        return responseData;
        
    // Catch errors
    } catch (error) {
        console.error('Error exporting map:', error);
        return false;
    }
}
