// CANVAS MODULE
// DETAIL NODE MODULE

// Import modules
import { sanitizeInput } from '../utils/validate.js';
import { deleteNode } from './deleteNode.js';
import { updateNode } from './updateNode.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function detailNode() {
    // Get selected node Id
    const nodeId = braintroop.selected.id;
    // Open detail popup
    openDetailPopup(nodeId);
}

// Open detail popup
export async function openDetailPopup() {
    // Remove existing detail popup
    if (document.getElementById('detail-node-popup'))
        removeDetailPopup();
    // Load detail popup
    await loadDetailPopup();
    // Load detail content
    loadDetailContent();
    // Bind detail popup events
    bindDetailPopupEvents();    
    // Show detail popup
    if (document.getElementById('detail-node-popup'))
        document.getElementById('detail-node-popup').style.display = 'flex';
}

// Load detail popup
async function loadDetailPopup() {
    try {
        const response = await fetch('./snippets/detail-node-popup.html');
        if (!response.ok) throw new Error('Failed to load detail-node-popup.html');
        const html = await response.text();
        // Add node popup
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading detail node popup:', error);
    }
}

// Bind detail popup events
function bindDetailPopupEvents() {
    // Elements
    const closeBtn = document.getElementById('close-detail-node-popup');
    const shortName = document.getElementById('detail-node-short-name');
    const contentEl = document.getElementById('detail-node-content');
    const detailEl = document.getElementById('detail-node-detail');
    const submitBtn = document.getElementById('detail-node-submit');
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeDetailPopup);
    if (shortName) shortName.addEventListener('click', () => editElement('short-name'));
    if (contentEl) contentEl.addEventListener('click', () => editElement('content'));
    if (detailEl) detailEl.addEventListener('click', () => editElement('detail'));
    if (submitBtn) submitBtn.addEventListener('click', closeDetailPopup);
    document.addEventListener('click', outsideClickHandler);
}

// Load detail content
function loadDetailContent() {
    // Get selected node id
    let nodeId = braintroop.selected.type === 'node' ? braintroop.selected.id : null;
    if (!nodeId) { console.error('No node selected'); return; }
    // Get node from map
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (!node) { console.warn('No node found'); return; }
    // Set short name
    const shortName = node ? node.shortName : "Title";
    const shortNameEl = document.getElementById('detail-node-short-name');
    if (shortNameEl) shortNameEl.innerText = shortName;
    // Set content
    const content = node ? node.content : "Content";
    const contentEl = document.getElementById('detail-node-content');
    if (contentEl) contentEl.innerText = content;
    // Set detail
    const detail = node ? node.detail : "Detail";
    const detailEl = document.getElementById('detail-node-detail');
    if (detailEl) detailEl.innerText = detail;
    // Set node content
    const nodeContent = { shortName, content, detail };
    document.getElementById('detail-node-popup').dataset.nodeContent = JSON.stringify(nodeContent);
}

// Edit element (h2 or p turns into textarea)
function editElement(type) {
    // Get element
    if (!type) { console.error('Missing type'); return; }
    const elId = `detail-node-${type}`;
    const el = document.getElementById(elId);
    if (!el) { console.error(`Unable to find element ${elId}`); return; }
    // Store original properties
    const originalTag = el.tagName.toLowerCase();
    const originalClass = el.className;
    // Create textarea
    const textarea = document.createElement('textarea');
    // Set ID to preserve getElementById functionality
    textarea.id = el.id;
    // Store original data in dataset
    textarea.dataset.originalTag = originalTag;
    textarea.dataset.originalClass = originalClass;
    // Style textarea
    textarea.value = el.innerText;
    // Select lines and clean up
    switch (type) {
        case 'short-name':
            textarea.rows = 1;
            if (textarea.value === 'Title') textarea.value = '';
            break;
        case 'content':
            textarea.rows = 2;
            if (textarea.value === 'Content') textarea.value = '';
            break;
        case 'detail':
            textarea.rows = 10;
            if (textarea.value === 'Detail') textarea.value = '';
            break;
    }
    // Replace element
    el.parentNode.replaceChild(textarea, el);
    // Focus
    textarea.focus();
    // Create event listeners
    textarea.addEventListener('blur', finishEditing);
}

// Finish editing
function finishEditing(e) {
    const textarea = e.target;
    const value = textarea.value.trim();
    const originalTag = textarea.dataset.originalTag;
    const originalClass = textarea.dataset.originalClass;
    const originalId = textarea.id;
    // Recreate original element
    const newEl = document.createElement(originalTag);
    newEl.id = originalId;
    newEl.className = originalClass;
    newEl.innerText = value;
    // Replace textarea with new element
    textarea.parentNode.replaceChild(newEl, textarea);
    // Rebind click event based on ID
    let type;
    if (originalId === 'detail-node-short-name') type = 'short-name';
    else if (originalId === 'detail-node-content') type = 'content';
    else if (originalId === 'detail-node-detail') type = 'detail';
    if (type) {
        newEl.addEventListener('click', () => editElement(type));
    }
};

// Close detail popup
async function closeDetailPopup() {
    const nodeId = braintroop.selected.type === 'node' ? braintroop.selected.id : null;
    if (!nodeId) { console.error('No node selected'); return; }
    // Get input elements (could be original or textarea)
    const shortNameInput = document.getElementById('detail-node-short-name');
    const contentInput = document.getElementById('detail-node-content');
    const detailInput = document.getElementById('detail-node-detail');
    const detailPopup = document.getElementById('detail-node-popup');
    // Get new contents, handling textarea or original element
    const getValue = (input) => {
        if (!input) return '';
        const tag = input.tagName.toLowerCase();
        const rawValue = (tag === 'textarea') ? input.value : input.innerText;
        return sanitizeInput(rawValue.trim());
    };
    const newShortName = getValue(shortNameInput);
    const newContent = getValue(contentInput);
    const newDetail = getValue(detailInput);
    // Get original content
    const originalContent = detailPopup ? JSON.parse(detailPopup.dataset.nodeContent) : null;
    // Check new content empty
    if (newShortName.trim() === '' && newContent.trim() === '' && newDetail.trim() === '') {
        // Remove detail popup
        removeDetailPopup();
        // Delete node
        await deleteNode(nodeId);
        return;
    }
    // Check no changes (trim for comparison to ignore whitespace differences)
    if (newShortName === originalContent.shortName.trim() && 
        newContent === originalContent.content.trim() && 
        newDetail === originalContent.detail.trim()) {
        // Remove detail popup
        removeDetailPopup();
        return;
    }
    // If changed
    // Remove detail popup
    removeDetailPopup();
    // Show notification
    await showNotification('Processing...', 'info', 'wait');
    // Update node
    const changes = { nodeId, shortname: newShortName, content: newContent, detail: newDetail };
    await updateNode(changes);
    // Remove notification
    removeNotification();
}

// Remove detail popup
function removeDetailPopup() {
    // Remove event listeners
    if (document.getElementById("close-detail-node-popup"))
        document.getElementById("close-detail-node-popup").removeEventListener("click", closeDetailPopup);
    if (document.getElementById("detail-node-content"))
        document.getElementById("detail-node-content").removeEventListener("click", () => editElement('content'));
    if (document.getElementById("detail-node-detail"))
        document.getElementById("detail-node-detail").removeEventListener("click", () => editElement('detail'));
    if (document.getElementById("detail-node-submit"))
        document.getElementById("detail-node-submit").removeEventListener("click", closeDetailPopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove detail popup container
    if (document.getElementById('detail-node-popup'))
        document.getElementById('detail-node-popup').remove();
}

// Outside click handler
function outsideClickHandler(event) {
    // Element
    const detailPopup = document.getElementById('detail-node-popup');
    if (event.target === detailPopup) {
        closeDetailPopup();
    } 
}