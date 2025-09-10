// CANVAS MODULES
// TOGGLE THEME MODULE

// Import modules
// No modules

// Toggle theme
export function toggleTheme() {
    // Elements
    const themeToggle = document.getElementById('canvas');

    // Toggle theme changes on interface
    // Canvas background
    document.getElementById('canvas').classList.contains('light')?
            document.getElementById('canvas').classList.remove('light') : document.getElementById('canvas').classList.add('light');
    // Canvas zoom
    document.querySelector('.zoom-controls').classList.contains('light')?
            document.querySelector('.zoom-controls').classList.remove('light') : document.querySelector('.zoom-controls').classList.add('light');
    // Expand button
    if (document.getElementById('expand-btn'))
        document.getElementById('expand-btn').classList.contains('light')?
            document.getElementById('expand-btn').classList.remove('light') : document.getElementById('expand-btn').classList.add('light');
    // New map container
    if (document.getElementById('new-map-container')) 
        document.getElementById('new-map-container').classList.contains('light')?
            document.getElementById('new-map-container').classList.remove('light') : document.getElementById('new-map-container').classList.add('light');
    if (document.querySelector('.map-new-input-container'))
        document.querySelector('.map-new-input-container').classList.contains('light')?
            document.querySelector('.map-new-input-container').classList.remove('light') : document.querySelector('.map-new-input-container').classList.add('light');
    // Node tools / Link tools
    if (document.querySelector('.tools')) {
        document.querySelector('.tools').classList.contains('light') ? 
            document.querySelector('.tools').classList.remove('light') : document.querySelector('.tools').classList.add('light');
        document.querySelectorAll('.tools-btn').forEach(btn => btn.classList.contains('light') ? 
            btn.classList.remove('light') : btn.classList.add('light'));
        // Approve button
        document.getElementById('approve-node-btn').querySelector('i').classList.contains('light') ? 
            document.getElementById('approve-node-btn').querySelector('i').classList.remove('light') : document.getElementById('approve-node-btn').querySelector('i').classList.add('light');
        // Trash button
        document.getElementById('delete-node-btn').querySelector('i').classList.contains('light') ? 
            document.getElementById('delete-node-btn').querySelector('i').classList.remove('light') : document.getElementById('delete-node-btn').querySelector('i').classList.add('light');
    }
    // Color scheme menu
    if (document.getElementById('color-scheme-menu')) {
        document.getElementById('color-scheme-menu').classList.contains('light') ? 
            document.getElementById('color-scheme-menu').classList.remove('light') : document.getElementById('color-scheme-menu').classList.add('light');
    }
}
