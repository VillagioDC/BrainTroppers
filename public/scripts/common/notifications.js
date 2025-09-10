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
        msg.textContent = message;
        popup.classList.remove('success', 'error', 'info');
        popup.classList.add(type);
        icon.classList.remove('fa-spinner', 'spinning', 'fa-solic', 'fa-hand', 'fa-check-circle', 'fa-times-circle', 'fa-info-circle');
        // Set action icons
        if (action === 'wait') {
            icon.classList.add('fa-spinner', 'spinning');
        } else if (action === 'connect') {
            icon.classList.remove('fas');
            icon.classList.add('fa-solid','fa-hand','info');
        } else {
            icon.classList.add(
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-times-circle' :
                'fa-info-circle'
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