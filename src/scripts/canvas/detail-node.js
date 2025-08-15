// CANVAS
// DETAIL NODE SCRIPT

// DOM Elements
const detailNodeBtn = document.getElementById('detail-node-btn');
const detailNodeModal = document.getElementById('detail-node-popup');
const closeDetailNode = document.getElementById('close-detail-node-popup');
const detailNodeSubmit = document.getElementById('detail-node-submit');
const detailNodeTextArea = document.getElementById('detail-node-text');

// Show modal, fetch node content, and focus on text area
if (detailNodeBtn) {
    detailNodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const nodeDetailContent = mapGetNodeDetail();
        detailNodeTextArea.value = nodeDetailContent || '';
        detailNodeModal.style.display = 'block';
        detailNodeTextArea.focus();
    });
}

// Close modal
if (closeDetailNode) {
    closeDetailNode.addEventListener('click', function() {
        const nodeDetailContent = detailNodeTextArea.value.trim();
        mapNodeDetailUpdate(nodeDetailContent);
        detailNodeModal.style.display = 'none';
        detailNodeTextArea.value = '';
    });
}

// Submit edited node
if (detailNodeSubmit) {
    detailNodeSubmit.addEventListener('click', function() {
        const nodeDetailContent = detailNodeTextArea.value.trim();
        mapNodeDetailUpdate(nodeDetailContent);
        detailNodeModal.style.display = 'none';
        detailNodeTextArea.value = '';
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === detailNodeModal) {
        const nodeDetailContent = detailNodeTextArea.value.trim();
        mapNodeDetailUpdate(nodeDetailContent);
        detailNodeModal.style.display = 'none';
        detailNodeTextArea.value = '';
    }
});

function mapGetNodeDetail() {
    // Placeholder function to get node content
    console.log('mapGetNodeDetail called');
    return 'Placeholder node detail content'; 
}

function mapNodeDetailUpdate(content) {
    // Placeholder function for updating a node
    console.log('mapNodeDetailUpdate called with content:', content);
}