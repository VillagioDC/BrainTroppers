// NOTIFICATIONS SCRIPT
// Global notification function

let notificationTimeout = null;

async function showNotification(message, type = 'success', action = null) {
    try {
        if (!document.getElementById('notification-popup')) {
            await loadNotificationModal();
        }
        const popup = document.getElementById('notification-popup');
        const msg = document.getElementById('notification-message');
        const icon = document.getElementById('notification-icon');
        if (!popup || !msg || !icon) {
            throw new Error('Notification elements not found');
        }
        msg.textContent = message;
        popup.classList.remove('success', 'error', 'info');
        popup.classList.add(type);
        icon.classList.remove('fa-spinner', 'spinning', 'fa-check-circle', 'fa-times-circle', 'fa-info-circle');
        if (action === 'wait') {
            icon.classList.add('fa-spinner');
            icon.classList.add('spinning');
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
        if (action !== 'wait') {
            notificationTimeout = setTimeout(() => {
                popup.remove();
            }, 3000);
        }
    // Catch errors
    } catch (error) {
        console.error('Notification error:', error);
    }
}

async function loadNotificationModal() {
    try {
        const res = await fetch('./src/snippets/notification-popup.html');
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

function removeNotification() {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.remove();
    }
}