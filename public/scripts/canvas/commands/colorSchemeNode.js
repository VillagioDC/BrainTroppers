// CANVAS MODULES
// SET COLOR SCHEME TO NODE MODULE

// Import modules
import { showNotification } from '../../common/notifications.js';

// Delete node
export async function openColorSchemePopup(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    showNotification('Coming soon', 'info');
}