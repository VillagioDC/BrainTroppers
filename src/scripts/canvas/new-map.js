// CANVAS
// NEW MAP SCRIPT

(function() {
    // Elements
    const newMapBtn = document.getElementById("new-map-btn");
    let newMapContainer = document.getElementById("new-map-container");

    // Click on new map button on sidebar
    if (newMapBtn) newMapBtn.addEventListener("click", addNewMapClick);

    // Initialize function with new map container
    async function initNewMapContainer() {
        if (newMapContainer) return;
        // Load new map container
        await loadNewMapContainer();
        // Focus on text area
        document.getElementById('map-new-query').focus();
    }

    // Add new map container
    async function addNewMapClick() {
        // Remove existing map from canvas
        removeExistingMap();
        // Load new map container
        if (newMapContainer) return;
        // Load new map container
        await loadNewMapContainer();
        // Focus on text area
        document.getElementById('map-new-query').focus();
    }

    // Remove existing map from canvas
    function removeExistingMap() {
        // Remove existing map
        mindMapCanvas.removeMap();
    }

    // Load new map container
    async function loadNewMapContainer() {
        return await fetch('./src/snippets/map-new.html')
            .then(res => res.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
                newMapContainer = document.getElementById('new-map-container');
                bindNewMapEvents();
            });
    }

    // Bind new map events
    function bindNewMapEvents() {
        // Elements
        const query = document.getElementById('map-new-query');
        const submit = document.getElementById('map-new-submit');
        // Event listeners
        if (query) query.addEventListener('input', ResizeTextArea);
        if (submit) submit.addEventListener('click', createNewMap);
    }

    // Resize textarea
    function ResizeTextArea() {
        // Element
        let textArea = document.getElementById('map-new-query');
        if (!textArea) return;
        // Resize
        textArea.style.height = "auto";
        textArea.style.height = `${textArea.scrollHeight}px`;
    }

    // Create new map
    async function createNewMap() {
        // Check query
        const query = checkQuery();
        // Check query
        if (query) {
            // Add temp node
            const tempNodeId = addTempNode();
            // Close new map container
            removeNewMapContainer();
            // Create map
            const newMap = await createMap(query);
            // Remove temp node
            mindMapCanvas.deleteNode(tempNodeId);
            // Place new map
            if (newMap) {
                // Load new map on canvas
                mindMapCanvas.setData(newMap.projectId, newMap.nodes);
                // Create map item
                await createMapItem(newMap);
            }
        }
    }

    // Check query
    function checkQuery() {
        // Check content
        const query = document.getElementById('map-new-query');
        if (!query || !query.value || query.value.trim() === '') return null;
        // Return sanitized query
        return sanitizeInput(query.value);
    }

    // Sanitizing input
    function sanitizeInput(input) {
        // Sanitize input
        if (!input || input.trim() === '') return '';
        return input.replace(/[^\w\s@.-]/gi, '').trim();
    }

    // Add temp node
    function addTempNode() {
        // Add temp node    
        const id = `node-${Date.now()}`;
        const w = mindMapCanvas.canvas.offsetWidth;
        const h = mindMapCanvas.canvas.offsetHeight;
        const content = "Creating new map...";
        mindMapCanvas.addNode({ id, content, x: Math.random() * (w - 140) + 70, y: Math.random() * (h - 56) + 28 });
    }

    // Create map
    async function createMap(query) {
        try {
            // Set parameters
            const token = "ABC123";
            const body = { query };
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            //const url = `${process.env.API_URL}/mapNew`;
            const url = `http://localhost:8888/.netlify/functions`+`/mapNew`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('Session expired. Please log in again.', 'error');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Get new map
            const newMap = await response.json();
            return newMap;
            // Catch errors
            } catch (error) {
                console.error('Error adding node:', error);
                return false;
        }
    }

    // Create map item on sidebar
    async function createMapItem(newMap) {
        // Check map
        if (!newMap) return;
        // Fetch HTML
        const htmlEmpty = await fetch('./src/snippets/map-item.html')
        // Replace map title
        const html = htmlEmpty.replace('{{Title}}', newMap.title);
        // Insert HTML on sidebar map ul
        const mapList = document.getElementById('map-list');
        mapList.insertAdjacentHTML('afterbegin', html);
    }

    // Close new map container
    function removeNewMapContainer() {
        // Remove event listeners
        if (document.getElementById('map-new-query'))
            document.getElementById('map-new-query').removeEventListener('input', ResizeTextArea);
        if (document.getElementById('map-new-submit'))
            document.getElementById('map-new-submit').removeEventListener('click', createNewMap);
        // Remove new map container
        newMapContainer.remove();
        newMapContainer = null;
    }

    // Initialize
    initNewMapContainer();

})();