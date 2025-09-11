// CANVAS MODULES
// UPDATE NODE API MODULE

// Import modules
import { getLocalStorageCredentials } from '../../common/userLocalStorage.js';
import { setApiUrl } from '../utils/setApiUrl.js';
import { checkSessionExpired } from '../utils/checkSessionExpired.js';

// Create map api
export async function updateNodeApi(node) {
    try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        // Construct body
        const projectId = braintroop.getProjectId();
        const body = { userId, projectId, nodeId: node.nodeId, shortName: node.shortName, content: node.content, detail: node.detail, directLink: node.directLink, relatedLink: node.relatedLink, x: node.x, y: node.y, locked: node.locked, approved: node.approved, maximized: node.maximized, hidden: node.hidden, colorSchemeName: node.colorSchemeName };
        const url = setApiUrl('updateNode');
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
            console.error('Error updating map:', error);
            return false;
    }
}