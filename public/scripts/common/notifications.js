// NOTIFICATIONS MODULE

// Private timeout variable
let notificationTimeout = null;

export async function showNotification(message, type = 'success', action = null) {
    try {
        // Load notification modal
        if (!document.getElementById('notification-popup')) {
            await loadNotificationModal();
        }
        const popup = document.getElementById('notification-popup');
        const msg = document.getElementById('notification-message');
        const icon = document.getElementById('notification-icon');
        if (!popup || !msg || !icon) {
            throw new Error('Notification elements not found');
        }
        // Check and set notification theme
        setNotificationTheme();
        // Set notification message
        // Error <i class="bi bi-exclamation-triangle-fill"></i>
        // Info <i class="bi bi-info-circle-fill"></i>
        // Success <i class="bi bi-check-circle-fill"></i>
        // Spinner <i class="bi bi-arrow-clockwise"></i>
        msg.textContent = message;
        popup.classList.remove('success', 'error', 'info');
        popup.classList.add(type);
        icon.classList.remove('bi-exclamation-triangle-fill', 'bi-info-circle-fill', 'bi-check-circle-fill');
        icon.classList.remove('bi-arrow-clockwise', 'spinning');
        // Set action icons
        if (action === 'wait') { // wait for response
            icon.classList.add('bi-arrow-clockwise', 'spinning');
        } else if (action === 'connect') { // conect node
            icon.classList.add('bi-crosshair','info');
        } else {
            icon.classList.add( // success, error, info
                type === 'success' ? 'bi-check-circle-fill' :
                type === 'error' ? 'bi-exclamation-triangle-fill' :
                'bi-info-circle-fill'
            );
        }
        // Clear previous timeout
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        // Set timeout
        if (action !== 'wait' && action !== 'connect') {
            notificationTimeout = setTimeout(() => {
                popup.remove();
            }, 3000);
        }

    } catch (error) {
        console.error('Notification error:', error);
    }
}

// Load modal
async function loadNotificationModal() {
    try {
        const res = await fetch('./snippets/notification-popup.html');
        if (!res.ok) {
            throw new Error('Failed to fetch notification modal');
        }
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Failed to load notification popup:', error);
        throw error;
    }
}

// Set notification theme for canvas only
function setNotificationTheme() {
    // If not canvas, return
    if(!document.getElementById('canvas')) return;
    // Check and set light theme
    if(document.getElementById('canvas').classList.contains('light')) {
        document.getElementById('notification-popup').classList.add('light');
        document.getElementById('notification-popup').querySelector('p').classList.add('light');
        document.getElementById('notification-popup').querySelector('i').classList.add('light');
    }
}

// Remove notification
export function removeNotification() {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.remove();
    }
}