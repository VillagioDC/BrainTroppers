// CANVAS
// MAP MENU POPUP SCRIPT

(function() {
    // Elements
    let mapMenuPopup = null;
    let currentMapItem = null;

    // Event listeners
    function bindMapMenuBtnEvents() {
        // Add event listeners to all map menu buttons
        document.querySelectorAll('.map-menu-btn').forEach(button => {
            button.addEventListener('click', openMapMenu);
        });
    }
    
    async function openMapMenu(e) {
        e.stopPropagation();
        // Remove existing map menus
        await removeMapMenu();
        // Set current map item
        currentMapItem = e.currentTarget.closest('.map-item');
        // Show menu
        await loadMapMenu(e);
        addMapMenuListeners();
    };

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
        document.addEventListener('click', outsideClickHandler);
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
        document.removeEventListener('click', outsideClickHandler);
        // Remove popup container
        if (document.getElementById('map-menu-item'))
            document.getElementById('map-menu-item').remove();
    }

    // Outside click handler
    function outsideClickHandler(e) {
        if (!mapMenuPopup || !mapMenuPopup.contains(e.target)) {
            removeMapMenu();
        }
    }

    // Rename map
    async function renameMap(e) {
        // Remove map menu
        removeMapMenu();
        // Load rename map html
        await loadRenameMapPopup();
        // Bind event listeners
        bindRenameMapListeners();
        // Set title popup and input
        setRenameTitle(currentMapItem);
    }

    // Load rename map html
    async function loadRenameMapPopup() {
        try {
            const response = await fetch('./src/snippets/rename-title.html');
            if (!response.ok) throw new Error('Failed to load rename-title.html');
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error('Error loading rename map popup:', error);
        }
    }

    // Bind event listeners
    function bindRenameMapListeners() {
        // Elements
        const confirmBtn = document.getElementById('rename-title-confirm');
        const cancelBtn = document.getElementById('rename-title-cancel');
        // Event listeners
        if (confirmBtn) confirmBtn.addEventListener('click', renameConfirm);
        if (cancelBtn) cancelBtn.addEventListener('click', renameCancel);
        document.addEventListener('click', outsideRenameMapClickHandler);
    }

    // Set rename title popup and input
    function setRenameTitle(currentMapItem) {
        // Fill existing title
        const currentTitle = currentMapItem.querySelector('.map-title').textContent;
        const titleInput = document.getElementById('rename-title-input');
        if (!titleInput || !currentTitle) return;
        titleInput.value = currentTitle.trim();
        // Position popup near clicked button
        const buttonRect = currentMapItem.getBoundingClientRect();
        const popup = document.getElementById('rename-title-popup');
        if (!popup) return;
        popup.style.top = `${buttonRect.bottom + window.scrollY - 45}px`;
        // Focus
        titleInput.focus();
    }

    // Rename confirm
    async function renameConfirm() {
            // Get input value
            const input = document.getElementById('rename-title-input');
            if (!input) return;
            const newTitle = input.value.trim();
            if (newTitle) {
                // Show notification
                await showNotification('Processing...', 'info', 'wait');
                // Update title on database
                const updatedMap = await renameUpdate(newTitle);
                // Update title on canvas
                if (updatedMap) {
                    // Set local storage map
                    setLocalStorageMap(updatedMap);
                    // Update map title
                    const titleElement = currentMapItem.querySelector('.map-title');
                        if (titleElement) {
                            titleElement.textContent = newTitle;
                }}
                // Remove notification
                removeNotification();
            }
            // Remove popups
            removeRename();
        }

    // Update title on database
    async function renameUpdate(newTitle) {
        try {
            // Set parameters
            const { userId, sessionToken } = getLocalStorageCredentials();
            const body = { userId, projectId, newTitle };
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            };
            //const url = `${process.env.API_URL}/mapTitleUpdate`;
            const url = `http://localhost:8888/.netlify/functions/mapTitleUpdate`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('Session expired.', 'error');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Get updated map renamed
            const updatedMap = await response.json();
            return updatedMap;
        // Catch errors
        } catch (error) {
            console.error('Error renaming map:', error);
            showNotification('Failed to rename map', 'error');
            return false;
        }
    }

    // Rename cancel
    function renameCancel() {
            // Remove rename popup
            removeRename();
        }

    // Remove rename popup
    function removeRename() {
        // Remove event listeners
        if (document.getElementById('rename-title-confirm'))
            document.getElementById('rename-title-confirm').removeEventListener('click', renameConfirm);
        if (document.getElementById('rename-title-cancel'))
            document.getElementById('rename-title-cancel').removeEventListener('click', renameCancel);
        document.removeEventListener('click', outsideRenameMapClickHandler);
        // Remove popup container
        if (document.getElementById('rename-title-popup'))
            document.getElementById('rename-title-popup').remove();
        // Reset current map item
        currentMapItem = null;
    }

    // Outside click handler
    function outsideRenameMapClickHandler(e) {
        if (!document.getElementById('rename-title-popup') || !document.getElementById('rename-title-popup').contains(e.target)) {
            removeRename();
        }
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
    async function deleteMap() {
        // Get map id
        const projectId = currentMapItem.dataset.projectId;
        // Remove map if is current map
        if (braintroop.projectId === projectId) {
            // Remove map on canvas
            braintroop.removeMap();
            // Delete map on local storage
            removeLocalStorageMap();
            // Start new map
            const newMapBtn = document.getElementById('new-map-btn');
            if (newMapBtn) newMapBtn.click();
        }
        // Remove map on map list
        removeMapFromMapList(projectId);
        // Delete map on database
        const result = await deleteMapOnDatabase(projectId);
        // Show notification
        if (result && result.error)
            showNotification(result.error, 'error');
        if (result && result.message)
            showNotification(result.message, 'success');
        // Remove map menu
        removeMapMenu();
    }

    // Remove map from map list
    function removeMapFromMapList(projectId) {
        const mapList = document.getElementById('map-list');
        if (!mapList) return;
        const mapItem = mapList.querySelector(`[data-project-id="${projectId}"]`);
        if (mapItem) mapItem.remove();
    }

    // Delete map on database
    async function deleteMapOnDatabase(projectId) {
        try {
            // Set parameters
            const { userId, sessionToken } = getLocalStorageCredentials();
            const body = { userId, projectId };
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            };
            //const url = `${process.env.API_URL}/mapDelete`;
            const url = `http://localhost:8888/.netlify/functions/mapDelete`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('Session expired.', 'error');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Confirm result
            return true;
        // Catch errors
        } catch (error) {
            console.error('Error deleting map:', error);
            showNotification('Failed to delete map', 'error');
            return false;
        }
    }

    // On load
    bindMapMenuBtnEvents();

})();