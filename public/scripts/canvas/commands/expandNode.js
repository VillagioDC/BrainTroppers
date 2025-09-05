// CANVAS MODULE
// EXPAND NODE MODULE

// Import modules
import { checkQuery } from '../utils/validade.js';
import { expandNodeApi } from './expandNodeApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function expandNode() {
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
    if (document.getElementById("expand-node-submit"))
        document.getElementById("expand-node-submit").addEventListener("click", closeExpandPopup);
    document.addEventListener('click', outsideClickHandler);
}

// Load node content
function loadDetailContent() {
    // Get selected node
    const nodeID = braintroop.selected.id;
    if (!nodeID) { console.warn('No node selected'); return; }
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeID);
    if (!node) { console.warn('No node found'); return; }
    // Set short name
    const shortName = node ? node.shortName : "Title";
    const shortNameEl = document.getElementById('expand-node-short-name');
    if (shortNameEl) shortNameEl.innerText = shortName;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('expand-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('expand-node-detail');
    if (detailEl) detailEl.innerText = detail;
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
    // Remove expand popup container
    if (document.getElementById('expand-node-popup'))
        document.getElementById('expand-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    // Close expand popup
    const expandPopup = document.getElementById('expand-node-popup');
    if (e.target === expandPopup) closeExpandPopup();
}

// Close expand popup
async function closeExpandPopup() {
    // Check query
    let query = '';
    if (document.getElementById('expand-node-query'))
        query = checkQuery('expand-node-query');
    // If valid query
    if (query) {
        // Show notification
        await showNotification('Processing...', 'info', 'wait');
        // Parent id
        const parentId = braintroop.selected.id;
        const node = { parentId, shortName: 'New node'}
        // Remove expand popup
        removeExpandPopup();
        // Add node with temp ip
        const nodeId = addTempNode( {node} );
        // Submit query to expand node
        const updatedMap = await expandNodeApi( { parentId, query} );
        // Remove temp node
        if (!updatedMap)
            braintroop.deleteNode(nodeId);
        if (updatedMap) {
            // Set data
            braintroop.setData(updatedMap);
          }
        // Remove notification
        removeNotification();
    } else {
      // Remove expand popup
      removeExpandPopup();
    }
}