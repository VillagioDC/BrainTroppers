// CANVAS
// MAP MENU POPUP SCRIPT

// Initialize map menu
window.initMapMenu = function() {
    // Elements
    let currentMapItem = null;

    // Add event listeners to all map menu buttons
    document.querySelectorAll('.map-menu-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Remove existing map menus
            await removeMapMenu();
            // Set current map item
            currentMapItem = e.currentTarget.closest('.map-item');
            // Show menu
            await loadMapMenu(e);
            addMapMenuListeners();
        });
    });

    // Fetch and load map menu HTML
    async function loadMapMenu(event) {
        try {
            const response = await fetch('./src/snippets/map-menu-popup.html');
            if (!response.ok) throw new Error('Failed to load map-menu-popup.html');
            const html = await response.text();
            // Create popup container
            document.body.insertAdjacentHTML('beforeend', html);
            mapMenuPopup = document.getElementById("map-menu-item");
            // Position popup near the clicked button
            const buttonRect = currentMapItem.getBoundingClientRect();
            mapMenuPopup.style.top = `${buttonRect.bottom + window.scrollY - 45}px`;
            mapMenuPopup.style.left = `${buttonRect.right + window.scrollX}px`;
        } catch (error) {
            console.error('Error loading map menu:', error);
        }
    }

    // Add event listeners to map menu items
    function addMapMenuListeners() {
        document.getElementById('map-item-rename').addEventListener('click', renameMap);
        document.getElementById('map-item-share').addEventListener('click', shareMap);
        document.getElementById('map-item-download').addEventListener('click', downloadMap);
        document.getElementById('map-item-delete').addEventListener('click', deleteMap);
    }

    // Remove map menu HTML
    async function removeMapMenu() {
        // Remove event listeners from map menu items
        if (document.getElementById('map-item-rename'))
            document.getElementById('map-item-rename').removeEventListener('click', renameMap);
        if (document.getElementById('map-item-share'))
            document.getElementById('map-item-share').removeEventListener('click', shareMap);
        if (document.getElementById('map-item-download'))
            document.getElementById('map-item-download').removeEventListener('click', downloadMap);
        if (document.getElementById('map-item-delete'))
            document.getElementById('map-item-delete').removeEventListener('click', deleteMap);
        // Remove popup container
        if (document.getElementById('map-menu-item'))
            document.getElementById('map-menu-item').remove();
        // Reset current map item
        currentMapItem = null;
    }

    // Remove popups if clicked outside
    document.addEventListener('click', (e) => {
        if (!document.getElementById('map-menu-item')) return;
        if (mapMenuPopup && !mapMenuPopup.contains(e.target) && 
            !e.target.classList.contains('map-menu-btn')) {
            removeMapMenu();
        }
    });

    // Rename map
    function renameMap() {
        // Implement rename functionality
        console.log('Rename map clicked for:', currentMapItem);
        removeMapMenu();
    }

    // Share map
    function shareMap() {
        // Implement share functionality
        console.log('Share map clicked for:', currentMapItem);
        removeMapMenu();
    }

    // Download map
    function downloadMap() {
        // Implement download functionality
        console.log('Download map clicked for:', currentMapItem);
        removeMapMenu();
    }

    // Delete map
    function deleteMap() {
        // Implement delete functionality
        console.log('Delete map clicked for:', currentMapItem);
        removeMapMenu();
    }
}