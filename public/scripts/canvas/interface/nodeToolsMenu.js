// CANVAS MODULES
// NODE TOOLS MENU MODULE

// Import modules
import { detailNode } from '../commands/detailNode.js';
import { addNewNode } from '../commands/addNewNode.js';
import { addBlankNode } from '../commands/addBlankNode.js';
import { expandNode } from '../commands/expandNode.js';
import { rewriteNode } from '../commands/rewriteNode.js';
import { linkNode } from '../commands/linkNode.js';
import { rewireNode } from '../commands/rewireNode.js';
import { pinNode, unpinNode } from '../commands/pinNode.js';
import { approveNode } from '../commands/approveNode.js';
import { hideNode, unhideNode } from '../commands/hideNode.js';
import { layerNode } from '../commands/layerNode.js';
import { openColorSchemePopup } from '../commands/colorSchemeNode.js';
import { deleteNode } from '../commands/deleteNode.js';

export async function openNodeToolsMenu(selectedNode) {
    // Get selected node
    const node = selectedNode;
    if (!node || !node.nodeId) { console.error('No node selected'); return; }
    // Remove existing node tools menu
    removeNodeToolsMenu();
    // Load node tools menu
    await loadNodeToolsMenu();
    // Toggle tool buttons
    toggleNodeToolsButtons(node);
    // Show node tools menu
    const toolsMenu = document.getElementById('node-tools');
        if (toolsMenu) {
            toolsMenu.style.display = 'flex';
        }
    // Bind event listeners
    bindNodeToolsMenuEvents();
}

// Load node tools menu
async function loadNodeToolsMenu() {
    try {
        const response = await fetch('./snippets/node-tools.html');
        if (!response.ok) throw new Error('failed to load node-tools.html');
        const html = await response.text();
        // Create popup container
        // Element #node-tools is hidden (visibility=hidden)
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading node tools:', error);
    }
}

// Toggle node tool buttons
export function toggleNodeToolsButtons(node) {
    // Element
    if (!node || !node.nodeId) { console.warn('No valid node provided for toggling buttons'); return; }
    // Hide/unhide button
    if (node.hidden) {
        document.getElementById('hide-node-btn').style.display = 'none';
        document.getElementById('unhide-node-btn').style.display = 'flex';
    } else {
        document.getElementById('hide-node-btn').style.display = 'flex';
        document.getElementById('unhide-node-btn').style.display = 'none';
    }
    // Pin/unpin button
    if (!node.locked) {
        document.getElementById('unpin-node-btn').style.display = 'none';
        document.getElementById('pin-node-btn').style.display = 'flex';
    } else {
        document.getElementById('unpin-node-btn').style.display = 'flex';
        document.getElementById('pin-node-btn').style.display = 'none';
    }
    // Approve button
    if (node.approved) {
        document.getElementById('approve-node-btn').title = 'Revoke';
        document.querySelector('.fa-check-circle').style.color = '#7dbf4f';
    } else {
        document.getElementById('approve-node-btn').title = 'Approve';
        document.querySelector('.fa-check-circle').style.color = '#e0e0e0';
    }
}

// Bind event listeners
function bindNodeToolsMenuEvents() {
    // Add event listeners
    // Detail node button
    if (document.getElementById('detail-node-btn'))
        document.getElementById('detail-node-btn').addEventListener('click', detailNode);
    // Add new node button
    if (document.getElementById('add-node-btn'))
        document.getElementById('add-node-btn').addEventListener('click', addNewNode);
    // Blank button
    if (document.getElementById('blank-node-btn'))
        document.getElementById('blank-node-btn').addEventListener('click', addBlankNode);
    // Expand node button
    if (document.getElementById('expand-node-btn'))
        document.getElementById('expand-node-btn').addEventListener('click', expandNode);
    // Rewrite node button
    if (document.getElementById('rewrite-node-btn'))
        document.getElementById('rewrite-node-btn').addEventListener('click', rewriteNode);
    // Link node button
    if (document.getElementById('link-node-btn'))
        document.getElementById('link-node-btn').addEventListener('click', linkNode);
    // Rewire node button
    if (document.getElementById('rewire-node-btn'))
        document.getElementById('rewire-node-btn').addEventListener('click', rewireNode);
    // Pin node button
    if (document.getElementById('pin-node-btn'))
        document.getElementById('pin-node-btn').addEventListener('click', pinNode);
    // Unpin node button
    if (document.getElementById('unpin-node-btn'))
        document.getElementById('unpin-node-btn').addEventListener('click', unpinNode);
    // Approve node button
    if (document.getElementById('approve-node-btn'))
        document.getElementById('approve-node-btn').addEventListener('click', approveNode);
    // Hide node button
    if (document.getElementById('hide-node-btn'))
        document.getElementById('hide-node-btn').addEventListener('click', hideNode);
    // Unhide node button
    if (document.getElementById('unhide-node-btn'))
        document.getElementById('unhide-node-btn').addEventListener('click', unhideNode);
    // Layer node
    if (document.getElementById('layer-node-btn'))
        document.getElementById('layer-node-btn').addEventListener('click', layerNode);
    // Color scheme node button
    if (document.getElementById('color-node-btn'))
        document.getElementById('color-node-btn').addEventListener('click', openColorSchemePopup);
    // Delete node button
    if (document.getElementById('delete-node-btn'))
        document.getElementById('delete-node-btn').addEventListener('click', deleteNode);
    document.addEventListener('click', outsideClickHandler);
}

// Remove node tools menu
export function removeNodeToolsMenu() {
    // Remove event listeners
    // Detail node button
    if (document.getElementById('detail-node-btn'))
        document.getElementById('detail-node-btn').removeEventListener('click', detailNode);
    // Add new node button
    if (document.getElementById('add-node-btn'))
        document.getElementById('add-node-btn').removeEventListener('click', addNewNode);    
    // Add blank node button
    if (document.getElementById('blank-node-btn'))
        document.getElementById('blank-node-btn').removeEventListener('click', addBlankNode);
    // Expand node button
    if (document.getElementById('expand-node-btn'))
        document.getElementById('expand-node-btn').removeEventListener('click', expandNode);    
    // Rewrite node button
    if (document.getElementById('rewrite-node-btn'))
        document.getElementById('rewrite-node-btn').removeEventListener('click', rewriteNode);
    // Link node button
    if (document.getElementById('link-node-btn'))
        document.getElementById('link-node-btn').removeEventListener('click', linkNode);
    // Rewire node button
    if (document.getElementById('rewire-node-btn'))
        document.getElementById('rewire-node-btn').removeEventListener('click', rewireNode);
    // Pin node button
    if (document.getElementById('pin-node-btn'))
        document.getElementById('pin-node-btn').removeEventListener('click', pinNode);
    // Unpin node button
    if (document.getElementById('unpin-node-btn'))
        document.getElementById('unpin-node-btn').removeEventListener('click', unpinNode);
    // Approve node button
    if (document.getElementById('approve-node-btn'))
        document.getElementById('approve-node-btn').removeEventListener('click', approveNode);
    // Hide node button
    if (document.getElementById('hide-node-btn'))
        document.getElementById('hide-node-btn').removeEventListener('click', hideNode);
    // Unhide node button
    if (document.getElementById('unhide-node-btn'))
        document.getElementById('unhide-node-btn').removeEventListener('click', unhideNode);
    // Layer node
    if (document.getElementById('layer-node-btn'))
        document.getElementById('layer-node-btn').removeEventListener('click', layerNode);
    // Color scheme node button
    if (document.getElementById('color-node-btn'))
        document.getElementById('color-node-btn').removeEventListener('click', openColorSchemePopup);
    // Delete node button
    if (document.getElementById('delete-node-btn'))
        document.getElementById('delete-node-btn').removeEventListener('click', deleteNode);
    document.removeEventListener('click', outsideClickHandler);
    // Remove popup container
    if (document.getElementById('node-tools')) {
        document.getElementById('node-tools').remove();
    }
}

// Click outside event handler
function outsideClickHandler(event) {
    return;
    const toolsMenu = document.getElementById('node-tools');
    if (!toolsMenu.contains(event.target)) removeNodeToolsMenu();
}