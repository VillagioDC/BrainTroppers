// CANVAS MODULES
// LINK TOOLS MENU MODULE

// Import modules
import { unlinkNode } from "./unlinkNode.js";
import { directLink, relatedLink } from "./toggleLinkType.js";

export async function openLinkToolsMenu(edge) {
    // Check edgeId
    if (!edge || !edge.id || !edge.type) return;
    // Remove existing link tools menu
    removeLinkToolsMenu();
    // Load link tools menu
    await loadLinkToolsMenu(edge);
    // Toggle tool buttons
    toggleLinkToolsButtons(edge);
    // Show link tools menu
    const toolsMenu = document.getElementById('link-tools');
    if (toolsMenu) {
        toolsMenu.style.display = 'flex';
    }
    // Bind event listeners
    bindLinkToolsMenuEvents();
}

// Load link tools menu
async function loadLinkToolsMenu(edge) {
    try {
        const response = await fetch('./snippets/link-tools.html');
        if (!response.ok) throw new Error('failed to load link-tools.html');
        const raw = await response.text();
        const html = raw.replace('{{selectedEdgeId}}', edge.id);
        // Create popup container
        // Element #node-tools is hidden (visibility=hidden)
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading edge tools:', error);
    }
}

// Toggle edge tool buttons
function toggleLinkToolsButtons(edge) {
    // Element
    if (!edge || !edge.type) { console.warn('No valid edge provided for toggling buttons'); return; }
    // Directed/related button
    if (edge.type === 'direct') {
        document.getElementById('direct-link-btn').style.display = 'none';
        document.getElementById('related-link-btn').style.display = 'flex';
    } else {
        document.getElementById('direct-link-btn').style.display = 'flex';
        document.getElementById('related-link-btn').style.display = 'none';
    }
}

// Bind event listeners
function bindLinkToolsMenuEvents() {
    // Add event listeners
    // Unlink node button
    if (document.getElementById('unlink-node-btn'))
        document.getElementById('unlink-node-btn').addEventListener('click', unlinkNode);
    // Direct link button
    if (document.getElementById('direct-link-btn'))
        document.getElementById('direct-link-btn').addEventListener('click', directLink);
    // Related link button
    if (document.getElementById('related-link-btn'))
        document.getElementById('related-link-btn').addEventListener('click', relatedLink);
    // Bind click outside event handler
    document.addEventListener('click', outsideClickHandler);
}

// Remove link tools menu
export function removeLinkToolsMenu() {
    // Remove event listeners
    // Unlink node button
    if (document.getElementById('unlink-node-btn'))
        document.getElementById('unlink-node-btn').removeEventListener('click', unlinkNode);
    // Direct link button
    if (document.getElementById('direct-link-btn'))
        document.getElementById('direct-link-btn').removeEventListener('click', directLink);
    // Related link button
    if (document.getElementById('related-link-btn'))
        document.getElementById('related-link-btn').removeEventListener('click', relatedLink);
    document.removeEventListener('click', outsideClickHandler);
    // Remove popup container
    if (document.getElementById('link-tools')) {
        document.getElementById('link-tools').remove();
    }
}

// Click outside event handler
function outsideClickHandler(event) {
    const toolsMenu = document.getElementById('link-tools');
    if (!toolsMenu.contains(event.target)) removeLinkToolsMenu();
}