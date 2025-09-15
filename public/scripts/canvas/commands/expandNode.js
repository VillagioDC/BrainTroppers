// CANVAS MODULE
// EXPAND NODE MODULE

// Import modules
import { svgSpark } from '../interface/svgSpark.js';
import { checkQuery } from '../utils/validate.js';
import { updateMapApi } from '../apis/updateMapApi.js';
import { expandNodeApi } from '../apis/expandNodeApi.js';
import { updateMapGetStatus } from '../poolling/updateMapGetStatus.js';
import { pauseS } from '../utils/pauseS.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function expandNode() {
    // Get selected node Id
    const parentId = braintroop.getSelectedNodeId();
    if (!parentId) { console.error('No node selected'); return; }
    // Open expand node popup
    openExpandNodePopup();
}

async function openExpandNodePopup() {
    // Check existing popup
    if (document.getElementById('expand-node-popup')) return;
    // Load expand node popup
    await loadExpandNode();
    // Bind expand popup events
    bindExpandPopupEvents();
    // Load detail content
    loadDetailContent();
    // Add spark icon
    if (document.getElementById('expand-node-submit'))
        document.getElementById('expand-node-submit').innerHTML += '&nbsp;' + svgSpark();
    // Show expand popup
    if (document.getElementById('expand-node-popup'))
        document.getElementById('expand-node-popup').style.display = 'flex';
}

// Load expand popup
async function loadExpandNode() {
    try {
        const response = await fetch('./snippets/expand-node-popup.html');
        if (!response.ok) throw new Error('Failed to load expand-node-popup.html');
        const html = await response.text();
        // Add node popup
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading expand node popup:', error);
    }
}

// Bind expand popup events
function bindExpandPopupEvents() {
    // Event listeners
    // Close rewrite popup button
    if (document.getElementById("close-expand-node-popup"))
        document.getElementById("close-expand-node-popup").addEventListener("click", closeExpandPopup);
    // Submit query button
    if (document.getElementById("expand-node-form"))
        document.getElementById("expand-node-form").addEventListener("submit", handleExpandNode);
    // Outside click handler
    document.addEventListener('click', outsideClickHandler);
    // Keydown handler
    document.addEventListener('keydown', keydownHandler);
}

// Load node content
function loadDetailContent() {
    // Get selected node
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.warn('No node selected'); return; }
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (!node) { console.warn('No node found'); return; }
    // Set topic
    const topic = node ? node.topic : "Topic";
    const topicEl = document.getElementById('expand-node-topic');
    if (topicEl) topicEl.innerText = topic;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('expand-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('expand-node-detail');
    if (detailEl) detailEl.innerText = detail;
}

// Close expand popup
function closeExpandPopup() {
    // Remove expand popup
    removeExpandPopup();
}

// Handle expand node
async function handleExpandNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get parent node
    const parentId = braintroop.getSelectedNodeId();
    if (!parentId) { console.error('No node selected'); return; }
    // Element
    const queryEl = document.getElementById('expand-node-query');
    if (!queryEl) { console.error('Missing query element'); return; };
    // Check query
    const query = checkQuery(queryEl);
    // If valid query
    if (query) {
        // Remove expand popup
        removeExpandPopup();
        // Show notification
        await showNotification('Requesting', 'info', 'wait');
        // Save current map
        const currentMap = braintroop.getBackendMap();
        const uptadedMap = await updateMapApi(currentMap);
        // Check error requesting map
        if (!uptadedMap || typeof uptadedMap !== 'object') {
            // Show error notification
            showNotification('Error creating node', 'error');
            return;
        }
        // New node
        const newNode = { parentId, topic: 'New node'}
        // Add node with temp id
        const newNodeId = braintroop.addTempNode(newNode);
        // Submit query to expand node
        const request = await expandNodeApi( { parentId, query} );
        if (!request || typeof request !== 'object' || !request.statusCode || request.statusCode !== 202) {
            // Remove temp node (placeholder)
            braintroop.deleteNode(newNodeId);
            // Show error notification
            showNotification('Error expanding node', 'error');
            return;
        };
        // Get projectId
        const projectId = braintroop.getProjectId();
        // Pooling node
        await showNotification('Creating', 'info', 'wait');
        await pauseS(40);
        let creationStatus = 'creating';
        let result = {};
        while (creationStatus === 'creating') {
            // Call api
            result = await updateMapGetStatus(projectId);
            // Check status { status, map?}
            if (result && result.status) {
                creationStatus = result.status;
            }
            // Wait
            if (creationStatus === 'creating') await pauseS(15);
        }
        // Remove temp node
        braintroop.deleteNode(newNodeId);
        // Update node
        if (result && result.map && result.status === 'created') {
            // Set map
            braintroop.setMap(result.map);           
            // Remove notification
            removeNotification();
        } else {
            // Show error notification
            showNotification('Error expanding node', 'error');
            // Restore map creation status
            await updateMapApi(uptadedMap);
        }
    } else {
        // Remove add popup
        removeAddPopup();
    }
}

// Remove expand popup
function removeExpandPopup() {
    // Remove event listeners
    // Close expand popup button
    if (document.getElementById("close-expand-node-popup"))
        document.getElementById("close-expand-node-popup").removeEventListener("click", closeExpandPopup);
    // Submit query button
    if (document.getElementById("expand-node-submit"))
        document.getElementById("expand-node-submit").removeEventListener("click", closeExpandPopup);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', keydownHandler);
    // Remove expand popup container
    if (document.getElementById('expand-node-popup'))
        document.getElementById('expand-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    // Close expand popup
    const expandPopup = document.getElementById('expand-node-popup');
    if (e.target === expandPopup) removeExpandPopup();
}

// Escape keydown handler
function keydownHandler(event) {
    if (event.key === 'Escape') {
        removeExpandPopup();
    }
}