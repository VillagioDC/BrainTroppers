// CANVAS MODULES
// NODE TOOLS MENU MODULE

// Import modules
import { addBlankNode } from './addBlankNode.js';

export async function openNodeToolsMenu(node) {
    // Check nodeId
    if (!node || !node.id) return;
    console.log('Node tools menu opened');
    // Load node tools menu
    await loadNodeToolsMenu(node);
    // Toggle tool buttons
    toggleNodeToolsButtons(node);
    // Show node tools menu
    document.getElementById('node-tools').style.visibility = 'visible';
    // Bind event listeners
    bindNodeToolsMenuEvents();
}

// Load node tools menu
async function loadNodeToolsMenu(node) {
    try {
        const response = await fetch('./src/snippets/node-tools.html');
        if (!response.ok) throw new Error('failed to load node-tools.html');
        const raw = await response.text();
        const html = raw.replace('{{selectedNodeId}}', node.id);
        // Create popup container
        // Element #node-tools is hidden (visibility=hidden)
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading node tools:', error);
    }
}

// Toggle node tool buttons
function toggleNodeToolsButtons(nodeId) {
    // Element
    // Hide/unhide button
    if (nodeId.hidden) {
        document.getElementById('hide-node-btn').style.display = 'none';
        document.getElementById('unhide-node-btn').style.display = 'flex';
    } else {
        document.getElementById('hide-node-btn').style.display = 'flex';
        document.getElementById('unhide-node-btn').style.display = 'none';
    }
    // Pin/unpin button
    if (!nodeId.locked) {
        document.getElementById('unpin-node-btn').style.display = 'none';
        document.getElementById('pin-node-btn').style.display = 'flex';
    } else {
        document.getElementById('unpin-node-btn').style.display = 'flex';
        document.getElementById('pin-node-btn').style.display = 'none';
    }
}

// Bind event listeners
function bindNodeToolsMenuEvents() {
    // Add event listeners
    if (document.getElementById('blank-node-btn'))
        document.getElementById('blank-node-btn').addEventListener('click', addBlankNode);
    document.addEventListener('click', outsideClickHandler);
}

// Remove node tools menu
export function removeNodeToolsMenu() {
    // Remove event listeners
    if (document.getElementById('blank-node-btn'))
        document.getElementById('blank-node-btn').removeEventListener('click', addBlankNode);
    document.removeEventListener('click', outsideClickHandler);
    // Remove popup container
    if (document.getElementById('node-tools')) {
        document.getElementById('node-tools').remove();
    }
    console.log('Node tools menu removed');
}

// Click outside event handler
function outsideClickHandler(event) {
    const toolsMenu = document.getElementById('node-tools');
    if (!toolsMenu.contains(event.target)) removeNodeToolsMenu();
}