// ADD NODE SCRIPT

// DOM Elements
const addNodeBtn = document.getElementById('add-node-btn');
const addNodeModal = document.getElementById('add-node-popup');
const closeAddNode = document.getElementById('close-add-node-popup');
const addNodeSubmit = document.getElementById('add-node-submit');
const addNodeTextArea = document.getElementById('add-node-text');

// Show modal and focus on text area
if (addNodeBtn) {
    addNodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addNodeModal.style.display = 'block';
        addNodeTextArea.focus();
    });
}

// Close modal
if (closeAddNode) {
    closeAddNode.addEventListener('click', function() {
        addNodeModal.style.display = 'none';
        addNodeTextArea.value = ''; // Clear text area
    });
}

// Submit node
if (addNodeSubmit) {
    addNodeSubmit.addEventListener('click', function() {
        const nodeContent = addNodeTextArea.value.trim();
        if (nodeContent) {
            mapNodeAdd(nodeContent); // Call placeholder function
        }
        addNodeModal.style.display = 'none';
        addNodeTextArea.value = ''; // Clear text area
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === addNodeModal) {
        addNodeModal.style.display = 'none';
        addNodeTextArea.value = ''; // Clear text area
    }
});

function mapNodeAdd(content) {
    // Placeholder function for adding a node
    console.log('mapNodeAdd called with content:', content);
}