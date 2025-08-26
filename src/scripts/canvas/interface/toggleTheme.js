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

            // Toggle theme changes on canvas
    // Implement here
    
}
