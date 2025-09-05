// CANVAS MODULES
// VALIDATE MODULE

// Import modules
import { showNotification } from "../../common/notifications.js";

// Check query
export function checkQuery(queryEl) {
    // Check content
    if (!queryEl || !queryEl.value || queryEl.value.trim() === '') {
        showNotification('Provide a query', 'error');
        return null;
    }
    // Return sanitized query
    return sanitizeInput(queryEl.value);
}

// Sanitizing input
export function sanitizeInput(input) {
    // Sanitize input
    if (!input || input.trim() === '') return '';
    return input.replace(/[^\w\s@.-]/gi, '').trim();
}