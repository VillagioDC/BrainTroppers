// CANVAS MODULES
// ADD NEW NODE MODULE

// Import modules
import { svgSpark } from '../interface/svgSpark.js';
import { checkQuery } from '../utils/validate.js';
import { updateMapApi } from '../apis/updateMapApi.js';
import { addNewNodeApi } from '../apis/addNewNodeApi.js'
import { updateMapGetStatus } from '../poolling/updateMapGetStatus.js';
import { pauseS } from '../utils/pauseS.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Add node to selected node
export async function addNewNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected nodeId
    const parentId = braintroop.getSelectedNodeId();
    if (!parentId) { console.error('No node selected'); return; }
    // Open add new node popup
    openNewNodePopup();
}

async function openNewNodePopup() {
    // Remove existing popup
    if (document.getElementById('add-node-popup'))
        removeAddPopup();
    // Load add new node popup
    await loadAddPopup();
    // Bind add popup events
    bindAddPopupEvents();
    // Load detail content
    loadDetailContent();
    // Add spark icon 
    if (document.getElementById('add-node-submit'))
        document.getElementById('add-node-submit').innerHTML += '&nbsp;' + svgSpark();
    // Show add popup
    if (document.getElementById('add-node-popup'))
        document.getElementById('add-node-popup').style.display = 'flex';
}

// Load add popup
async function loadAddPopup() {
    try {
        const response = await fetch('./snippets/add-node-popup.html');
        if (!response.ok) throw new Error('Failed to load add-node-popup.html');
        const html = await response.text();
        // Add node popup
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading add new node popup:', error);
    }
}

// Bind add popup events
function bindAddPopupEvents() {
    // Event listeners
    // Close add popup button
    if(document.getElementById('close-add-node-popup'))
        document.getElementById("close-add-node-popup").addEventListener("click", closeAddPopup);
    // Submit query button
    if (document.getElementById('add-node-form'))
        document.getElementById("add-node-form").addEventListener("submit", handleAddNode);
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
    const topicEl = document.getElementById('add-node-topic');
    if (topicEl) topicEl.innerText = topic;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('add-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('add-node-detail');
    if (detailEl) detailEl.innerText = detail;
}

// Handle add popup
async function handleAddNode(e) {
    e.preventDefault();    
    // Get parent node
    const parentId = braintroop.getSelectedNodeId();
    if (!parentId) { console.error('No node selected'); return; }
    // Element
    const queryEl = document.getElementById('add-node-query');
    if (!queryEl) { console.error('Missing query element'); return; };
    // Check query
    const query = checkQuery(queryEl);
    // If valid query
    if (query) {
        // Remove add popup
        removeAddPopup();
        // Show notification
        await showNotification('Requesting', 'info', 'wait');
        // Save current map
        const currentMap = braintroop.getBackendMap();
        const updatedMap = await updateMapApi(currentMap);
        // Check error requesting map
        if (!updatedMap || typeof updatedMap !== 'object') {
            // Show error notification
            showNotification('Error creating node', 'error');
            return;
        }
        // New node
        const newNode = { parentId, topic: 'New node'}
        // Add node with temp id
        const newNodeId = braintroop.addTempNode(newNode);
        // Submit query to add node
        const request = await addNewNodeApi( {parentId, query} );
        // Check error requesting map
        if (!request || typeof request !== 'object' || !request.statusCode || request.statusCode !== 202) {
            // Remove temp node (placeholder)
            braintroop.deleteNode(newNodeId);
            // Show error notification
            showNotification('Error creating node', 'error');
            return;
        };
        // Get projectId
        const projectId = braintroop.getProjectId();
        // Pooling node
        await showNotification('Creating', "info", 'wait');
        await pauseS(40);
        let creationStatus = 'creating';
        let result = {};
        while (creationStatus === 'creating') {
            // Call api
            result = await updateMapGetStatus(projectId);
            // Check status {status, map}
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
            showNotification('Error creating node', 'error');
            // Restore map creation status
            await updateMapApi(updatedMap);
        }
    } else {
        // Remove add popup
        removeAddPopup();
    }
}

// Close add popup
async function closeAddPopup() {
    // Remove add popup
    removeAddPopup();
}

// Remove add popup
function removeAddPopup() {
    // Remove event listeners
    // Close add popup button
    if (document.getElementById("close-add-node-popup"))
        document.getElementById("close-add-node-popup").removeEventListener("click", closeAddPopup);
    // Submit query button
    if (document.getElementById("add-node-form"))
        document.getElementById("add-node-form").removeEventListener("submit", handleAddNode);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', keydownHandler);
    // Remove add popup container
    if (document.getElementById('add-node-popup'))
        document.getElementById('add-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    const addNewNodePopup = document.getElementById('add-node-popup');
    if (e.target === addNewNodePopup) removeAddPopup();
}

// Escape keydown handler
function keydownHandler(event) {
    if (event.key === 'Escape') {
        removeAddPopup();
    }
}