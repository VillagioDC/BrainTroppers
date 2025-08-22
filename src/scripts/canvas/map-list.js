// CANVAS
// MAP LIST SCRIPT

(function() {

    // Create map items
    async function createMapItems() {
        // Read local storage user
        const user = getLocalStorageUser();
        if (!user || !user.maps || user.maps.length === 0) return;
        // Load map item HTML
        const html = await loadMapItemHtml();
        if (!html) return;
        // Place map item on canvas
        placeMapItem(user.maps, html);
        // Add event listeners
        bindMapItemEvents();
    }

    // Load map item HTML
    async function loadMapItemHtml() {
        try {
            const response = await fetch('./src/snippets/map-item.html');
            if (!response.ok) throw new Error('failed to load map-item.html');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading map item:', error);
        }
    }

    // Place map item on sidebar map <ul>
    function placeMapItem(maps, html) {
        // Parent element <ul>
        const mapUL = document.getElementById('map-list');
        maps.forEach(map => {
            // Replace map title
            let mapItemHtml = html.replace('{{Title}}', map.title);
            // Replace map id
            mapItemHtml = mapItemHtml.replace('{{projectId}}', map.projectId);
            // Insert HTML
            mapUL.insertAdjacentHTML('afterbegin', mapItemHtml);            
        });
    }

    // Add event listeners
    function bindMapItemEvents() {
        // On map items
        const mapItems = document.querySelectorAll('.map-item');
        mapItems.forEach(mapItem => {
            mapItem.addEventListener('click', loadMap);
        });
        // On map menu buttons loaded on map menu popup
    }

    // Load map
    async function loadMap(e) {
        const projectId = e.target.closest('.map-item').dataset.projectId;
        // Remove existing map menus on canvas
        mindMapCanvas.removeMap();
        // Load map on database
        const map = await loadMapFromDatabase(projectId);
        if (!map || typeof map !== 'object') return;
        // Set map on local storage
        setLocalStorageMap(map);
        // Set map on canvas
        // Implement
    }

    // Load map from database
    async function loadMapFromDatabase(projectId) {
        try {
            // Set parameters
            const { userId, token } = getLocalStorageCredentials();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            const body = { userId, projectId };
            //const url = `${process.env.API_URL}/mapRead`;
            const url = `http://localhost:8888/.netlify/functions/mapRead`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('Session expired', 'error');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Get updated node
            const updatedNode = await response.json();
            return updatedNode;
        // Catch errors
        } catch (error) {
            console.error('Error adding node:', error);
            return false;
        }
    }

    // On page load
    createMapItems();

})();