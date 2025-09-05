// CANVAS MODULES
// ADD NEW NODE MODULE

// Import modules
import { checkQuery } from '../utils/validade.js';
import { addNewNodeApi } from './addNewNodeApi.js'
import { showNotification, removeNotification } from '../../common/notifications.js';

// Add node to selected node
export async function addNewNode() {
    // Get selected node Id
    const parentId = braintroop.selected.id;
    // Add node
    const blankNode = {
        parentId,
        shortName: "New node",
        content: "",
        detail: ""
    }
    // Add blank node to canvas
    braintroop.addNode(blankNode);
    // Open add new node popup
    openNewNodePopup();
}

async function openNewNodePopup() {
    // Check existing popup
    if (document.getElementById('add-node-popup')) return;
    // Load add new node popup
    await loadAddPopup();
    // Bind add popup events
    bindAddPopupEvents();
}

// Load add popup
async function loadAddPopup() {
    try {
        const response = await fetch('./snippets/add-node-popup.html');
        if (!response.ok) throw new Error('Failed to load detail-node-popup.html');
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
    if (document.getElementById("close-add-node-popup"))
        document.getElementById("close-add-node-popup").addEventListener("click", closeAddPopup);
    // Submit query button
    if (document.getElementById("add-node-submit"))
        document.getElementById("add-node-submit").addEventListener("click", closeAddPopup);
    document.addEventListener('click', outsideClickHandler);
}

// Close add popup
async function closeAddPopup() {
    // Check query
    let query = '';
    if (document.getElementById('add-node-query'))
        query = checkQuery('add-node-query');
    // If valid query
    if (query) {
        // Show notification
        await showNotification('Processing...', 'info', 'wait');
        // Parent id
        const parentId = braintroop.selected.id;
        const node = { parentId, shortName: 'New node'}
        // Remove add popup
        removeAddPopup();
        // Add node with temp id
        const nodeId = addTempNode( {node} );
        // Submit query to add node
        const updatedMap = await addNewNodeApi( {parentId, query} );
        // Remove temp node
        if (!updatedMap)
        braintroop.deleteNode(nodeId);
        // Update node
        if (updatedMap) {
            // Set data
            braintroop.setData(updatedMap);
        }
        // Remove notification
        removeNotification();
    } else {
        // Remove add popup
        removeAddPopup();
    }
}

// Remove add popup
function removeAddPopup() {
    // Remove event listeners
    // Close add popup button
    if (document.getElementById("close-add-node-popup"))
        document.getElementById("close-add-node-popup").removeEventListener("click", closeAddPopup);
    // Submit query button
    if (document.getElementById("add-node-submit"))
        document.getElementById("add-node-submit").removeEventListener("click", closeAddPopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove add popup container
    if (document.getElementById('add-node-popup'))
        document.getElementById('add-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    const addNewNodePopup = document.getElementById('add-node-popup');
    if (e.target === addNewNodePopup) closeAddPopup();
}
