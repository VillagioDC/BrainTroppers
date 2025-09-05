// CANVAS MODULE
// REWRITE NODE MODULE

// Import modules
import { checkQuery } from "../utils/validade.js";
import { rewriteNodeApi } from "./rewriteNodeApi.js";
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function rewriteNode() {
  // No action here
  // Open rewrite node popup
  openRewriteNodePopup();
}

async function openRewriteNodePopup() {
    // Check existing popup
    if (document.getElementById('rewrite-node-popup')) return;
    // Load rewrite node popup
    await loadRewriteNode();
    // Bind rewrite popup events
    bindRewritePopupEvents();
    // Load detail content
    loadDetailContent();
}

// Load rewrite popup
async function loadRewriteNode() {
    try {
        const response = await fetch('./src/snippets/rewrite-node-popup.html');
        if (!response.ok) throw new Error('Failed to load rewrite-node-popup.html');
        const html = await response.text();
        // Add node popup
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading rewrite node popup:', error);
    }
}

// Bind rewrite popup events
function bindRewritePopupEvents() {
    // Event listeners
    // Close rewrite popup button
    if (document.getElementById("close-rewrite-node-popup"))
        document.getElementById("close-rewrite-node-popup").addEventListener("click", closeRewritePopup);
    // Submit query button
    if (document.getElementById("rewrite-node-submit"))
        document.getElementById("rewrite-node-submit").addEventListener("click", closeRewritePopup);
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
    const shortNameEl = document.getElementById('rewrite-node-short-name');
    if (shortNameEl) shortNameEl.innerText = shortName;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('rewrite-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('rewrite-node-detail');
    if (detailEl) detailEl.innerText = detail;
}

// Remove rewrite popup
function removeRewritePopup() {
    // Remove event listeners
    // Close rewrite popup button
    if (document.getElementById("close-rewrite-node-popup"))
        document.getElementById("close-rewrite-node-popup").removeEventListener("click", closeRewritePopup);
    // Submit query button
    if (document.getElementById("rewrite-node-submit"))
        document.getElementById("rewrite-node-submit").removeEventListener("click", closeRewritePopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove rewrite popup container
    if (document.getElementById('rewrite-node-popup'))
        document.getElementById('rewrite-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    // Close rewrite popup
    const rewritePopup = document.getElementById('rewrite-node-popup');
    if (e.target === rewritePopup) closeRewritePopup();
}

// Close rewrite popup
async function closeRewritePopup() {
    // Check query
    let query = '';
    if (document.getElementById('rewrite-node-query'))
        query = checkQuery('rewrite-node-query');
    // If valid query
    if (query) {
        // Show notification
        await showNotification('Processing...', 'info', 'wait');
        // Parent id
        const parentId = braintroop.selected.id;
        // Remove rewrite popup
        removeRewritePopup();
        // Submit query to rewrite node
        const updatedMap = await rewriteNodeApi( { parentId, query} );
        // Update map
        if (updatedMap) {
            // Set data
            braintroop.setData(updatedMap);
          }
        // Remove notification
        removeNotification();
    } else {
      // Remove rewrite popup
      removeRewritePopup();
    }
}