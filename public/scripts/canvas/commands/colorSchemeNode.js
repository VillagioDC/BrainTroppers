// CANVAS MODULES
// SET COLOR SCHEME TO NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';

// Delete node
export async function openColorSchemePopup(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected nodeId
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Remove existing color scheme popup
    if (document.getElementById('color-scheme-menu'))
        removeColorSchemePopup();
    // Load color scheme popup
    await loadcolorSchemePopup();
    // Color buttons and include title
    stylecolorSchemeButtons();
    // Bind color scheme popup events
    bindcolorSchemePopupEvents();
    // Show color scheme popup
    if (document.getElementById('color-scheme-menu'))
        document.getElementById('color-scheme-menu').style.display = 'flex';
}

// Load color scheme popup
async function loadcolorSchemePopup() {
    try {
        const response = await fetch('./snippets/color-scheme-popup.html');
        if (!response.ok) throw new Error('Failed to load color-scheme-popup.html');
        const html = await response.text();
        // Add color scheme popup
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading color-scheme popup:', error);
    }
}

// Set colors, include title, change button id,
function stylecolorSchemeButtons() {
    const schemas = braintroop.colorSchemes;
    // Set colors, include title, change button id,
    const defaultBtn = 'btn-set-color'
    schemas.forEach(scheme => {
        // Get color scheme
        const schemeName = scheme.name;
        // Set colors, include title, change button id,
        if (document.getElementById(defaultBtn)) {
            const button = document.getElementById(defaultBtn);
            // Button color
            button.style.background = scheme.fill;
            button.style.borderColor = scheme.stroke;
            button.style.color = scheme.text;
            // Icon color
            const icon = button.querySelector('i');
            icon.style.color = scheme.text;
            // Include title
            button.title = schemeName;
            // Id
            const buttonId = `btn-${schemeName}`;
            document.getElementById(defaultBtn).id = buttonId;
        }
    });
}

function bindcolorSchemePopupEvents() {
    // Event listeners
    const schemas = braintroop.colorSchemes;
    if (!schemas) return;
    schemas.forEach(scheme => {
        // Get color scheme
        const schemeName = scheme.name;
        // Add event listeners
            const buttonId = `btn-${schemeName}`;
        if (document.getElementById(buttonId))
            document.getElementById(buttonId).addEventListener('click', handleColorSchemeClick);
    });
    // Outside click handler
    document.addEventListener('click', outsideClickHandler);
    // Keydown handler
    document.addEventListener('keydown', keydownHandler);
}

async function handleColorSchemeClick(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    const colorSchemeEl = e.target.id || e.target.closest('button').id;
    if (!colorSchemeEl) return;
    // Get color scheme name
    const schemeName = colorSchemeEl.replace('btn-', '');
    if (!schemeName) return;
    // Update node color scheme
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Update color scheme
    braintroop.setColorScheme(nodeId, schemeName);
    // Update node
    const changes = { nodeId, colorSchemeName: schemeName };
    await updateNode(changes);    
}

function removeColorSchemePopup() {
    // Remove event listeners
    const schemas = braintroop.colorSchemes;
    if (!schemas) return;
    schemas.forEach(scheme => {
        // Get color scheme
        const schemeName = scheme.name;
        // Add event listeners
            const buttonId = `btn-${schemeName}`;
        if (document.getElementById(buttonId))
            document.getElementById(buttonId).removeEventListener('click', handleColorSchemeClick);
    });
    // Outside click handler
    document.removeEventListener('click', outsideClickHandler);
    // Keydown handler
    document.removeEventListener('keydown', keydownHandler);
    // Remove color scheme popup
    document.getElementById('color-scheme-menu').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    if (e && e.target && !document.getElementById('color-scheme-menu').contains(e.target)) {
        removeColorSchemePopup();
    }
}

// Escape keydown handler
function keydownHandler(event) {
    if (event.key === 'Escape') {
        removeColorSchemePopup();
    }
}