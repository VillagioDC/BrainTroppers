// CANVAS MODULE
// REWRITE NODE MODULE

// Import modules
import { svgSpark } from "../interface/svgSpark.js";
import { checkQuery } from "../utils/validate.js";
import { updateMapApi } from "../apis/updateMapApi.js";
import { rewriteNodeApi } from "../apis/rewriteNodeApi.js";
import { updateMapGetStatus } from "../poolling/updateMapGetStatus.js";
import { pauseS } from "../utils/pauseS.js";
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function rewriteNode(e) {
    // Get selected node Id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Open rewrite node popup
    openRewriteNodePopup();
}

async function openRewriteNodePopup() {
    // Check existing popup
    if (document.getElementById('rewrite-node-popup'))
        removeRewritePopup();
    // Load rewrite node popup
    await loadRewriteNode();
    // Bind rewrite popup events
    bindRewritePopupEvents();
    // Load detail content
    loadDetailContent();
    // Add spark icon
    if (document.getElementById('rewrite-node-submit'))
        document.getElementById('rewrite-node-submit').innerHTML += '&nbsp;' + svgSpark();
    // Show rewrite popup
    if (document.getElementById('rewrite-node-popup'))
        document.getElementById('rewrite-node-popup').style.display = 'flex';
}

// Load rewrite popup
async function loadRewriteNode() {
    try {
        const response = await fetch('./snippets/rewrite-node-popup.html');
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
    if (document.getElementById("rewrite-node-form"))
        document.getElementById("rewrite-node-form").addEventListener("submit", handleNodeRewrite);
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
    const topicEl = document.getElementById('rewrite-node-topic');
    if (topicEl) topicEl.innerText = topic;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('rewrite-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('rewrite-node-detail');
    if (detailEl) detailEl.innerText = detail;
}

// Handle node rewrite
async function handleNodeRewrite(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected node
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Element
    const queryEl = document.getElementById('rewrite-node-query');
    if (!queryEl) { console.error('Missing query element'); return; };
    // Check query
    const query = checkQuery(queryEl);
    // If valid query
    if (query) {
        // Remove rewrite popup
        removeRewritePopup();
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
        // Submit query to rewrite node
        const request = await rewriteNodeApi( { nodeId, query} );
        // Check error requesting map
        if (!request || typeof request !== 'object' || !request.statusCode || request.statusCode !== 202) {
            // Show error notification
            showNotification('Error rewriting node', 'error');
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
            // Check status { status, map }
            if (result && result.status) {
                creationStatus = result.status;
            }
            // Wait
            if (creationStatus === 'creating') await pauseS(15);
        }
        // Update node
        if (result && result.map && result.status === 'created') {
            // Set map
            braintroop.setMap(result.map);           
            // Remove notification
            removeNotification();
        } else {
            // Show error notification
            showNotification('Error rewriting node', 'error');
            // Restore map creation status
            await updateMapApi(updatedMap);
        }
    } else {
        // Remove add popup
        removeAddPopup();
    }
}

// Close rewrite popup
function closeRewritePopup() {
    // Remove rewrite popup
    removeRewritePopup();
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
    document.removeEventListener('keydown', keydownHandler);
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

// Escape keydown handler
function keydownHandler(event) {
    if (event.key === 'Escape') {
        removeRewritePopup();
    }
}