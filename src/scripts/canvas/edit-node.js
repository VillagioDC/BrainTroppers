// EDIT NODE SCRIPT

// DOM Elements
const editNodeBtn = document.getElementById('edit-node-btn');
const editNodeModal = document.getElementById('edit-node-popup');
const closeEditNode = document.getElementById('close-edit-node-popup');
const editNodeSubmit = document.getElementById('edit-node-submit');
const editNodeTextArea = document.getElementById('edit-node-text');

// Show modal, fetch node content, and focus on text area
if (editNodeBtn) {
    editNodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const nodeContent = mapGetNode();
        editNodeTextArea.value = nodeContent || '';
        editNodeModal.style.display = 'block';
        editNodeTextArea.focus();
    });
}

// Close modal
if (closeEditNode) {
    closeEditNode.addEventListener('click', function() {
        const nodeContent = editNodeTextArea.value.trim();
        if (nodeContent) {
            mapNodeUpdate(nodeContent);
        } else {
            mapNodeDelete();
        }
        editNodeModal.style.display = 'none';
        editNodeTextArea.value = '';
    });
}

// Submit edited node
if (editNodeSubmit) {
    editNodeSubmit.addEventListener('click', function() {
        const nodeContent = editNodeTextArea.value.trim();
        if (nodeContent) {
            mapNodeUpdate(nodeContent);
        } else {
            mapNodeDelete();
        }
        editNodeModal.style.display = 'none';
        editNodeTextArea.value = '';
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === editNodeModal) {
        const nodeContent = editNodeTextArea.value.trim();
        if (nodeContent) {
            mapNodeUpdate(nodeContent);
        } else {
            mapNodeDelete();
        }
        editNodeModal.style.display = 'none';
        editNodeTextArea.value = '';
    }
});

function mapGetNode() {
    // Placeholder function to get node content
    console.log('mapGetNode called');
    return 'Placeholder node content'; 
}

function mapNodeUpdate(content) {
    // Placeholder function for updating a node
    console.log('mapNodeUpdate called with content:', content);
}

function mapNodeDelete() {
    // Placeholder function for deleting a node
    console.log('mapNodeDelete called');
}