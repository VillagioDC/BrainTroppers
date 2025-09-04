// CANVAS MODULES
// EXPAND NODE API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Add new node api 
export async function expandNodeApi ( {parentId, query} ) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        // Construct body
        const projectId = braintroop.map.projectId;
        const body = { userId, projectId, parentId, query };
        const url = setApiUrl('expandNode');
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
        }
        // Get new map
        const updatedMap = responseData;
        return updatedMap;
        // Catch errors
        } catch (error) {
            console.error('Error expanding node:', error);
            return false;
    }
}