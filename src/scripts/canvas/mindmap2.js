class MindMap {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        this.selectedNode = null;
        this.connectMode = null;
        this.firstNode = null;
        this.initCytoscape();
        this.createExampleNodes();
        this.bindEvents();
    }

    initCytoscape() {
        // Get CSS variable values
        const rootStyles = getComputedStyle(document.documentElement);
        const backgroundShadow = rootStyles.getPropertyValue('--background-shadow').trim();
        const primary = rootStyles.getPropertyValue('--primary').trim();
        const accent = rootStyles.getPropertyValue('--accent').trim();
        const text = rootStyles.getPropertyValue('--text').trim();
        const goldPlan = rootStyles.getPropertyValue('--gold-plan').trim();

        // Initialize Cytoscape
        this.cy = cytoscape({
            container: this.canvas,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': backgroundShadow,
                        'border-color': primary,
                        'border-width': '1px',
                        'border-style': 'solid',
                        'width': '100px',
                        'height': '50px',
                        'shape': 'rectangle',
                        'label': 'data(content)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': text,
                        'font-size': '0.9rem',
                        'padding': '5px'
                    }
                },
                {
                    selector: 'node.selected',
                    style: {
                        'border-width': '3px',
                        'border-color': accent,
                        'border-opacity': 0.7
                    }
                },
                {
                    selector: 'node.approved',
                    style: {
                        'border-color': goldPlan,
                        'background-color': goldPlan,
                        'background-opacity': 0.2
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': '2px',
                        'line-color': primary,
                        'curve-style': 'bezier'
                    }
                },
                {
                    selector: 'edge.weak',
                    style: {
                        'line-style': 'dashed',
                        'line-dash-pattern': [5, 5]
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                nodeSep: 50,
                edgeSep: 10,
                rankSep: 100
            },
            zoom: 1,
            minZoom: 0.5,
            maxZoom: 2
        });

        // Enable pan and zoom
        this.cy.panningEnabled(true);
        this.cy.zoomingEnabled(true);
    }

    createExampleNodes() {
        // Add example nodes
        this.addNode({ id: '1', content: 'Project Core', x: 300, y: 200 });
        this.addNode({ id: '2', content: 'Feature A', x: 450, y: 300 });
        this.addNode({ id: '3', content: 'Feature B', x: 150, y: 300 });

        // Add example connections
        this.addConnection('1', '2', 'strong');
        this.addConnection('1', '3', 'weak');

        // Run layout
        this.runLayout();
    }

    addNode({ id, content, x, y }) {
        this.cy.add({
            group: 'nodes',
            data: { id, content },
            position: { x, y }
        });
        this.runLayout();
    }

    addConnection(fromId, toId, strength = 'strong') {
        const edgeId = `edge-${fromId}-${toId}`;
        this.cy.add({
            group: 'edges',
            data: { id: edgeId, source: fromId, target: toId, strength }
        });
        this.runLayout();
    }

    removeConnection(fromId, toId) {
        const edgeId1 = `edge-${fromId}-${toId}`;
        const edgeId2 = `edge-${toId}-${fromId}`;
        this.cy.remove(`edge[id="${edgeId1}"], edge[id="${edgeId2}"]`);
        this.runLayout();
    }

    selectNode(id) {
        this.cy.nodes().removeClass('selected');
        this.selectedNode = this.cy.getElementById(id);
        if (this.selectedNode) {
            this.selectedNode.addClass('selected');
        }
        this.connectMode = null;
        this.firstNode = null;
        this.canvas.style.cursor = 'default';
    }

    updateNode(id, content) {
        const node = this.cy.getElementById(id);
        if (node) {
            node.data('content', content);
            this.runLayout();
        }
    }

    deleteNode(id) {
        const node = this.cy.getElementById(id);
        if (node) {
            this.cy.remove(node);
            this.selectedNode = null;
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
            this.runLayout();
        }
    }

    runLayout() {
        this.cy.layout({
            name: 'dagre',
            rankDir: 'TB',
            nodeSep: 50,
            edgeSep: 10,
            rankSep: 100
        }).run();
    }

    bindEvents() {
        // Node click handling
        this.cy.on('tap', 'node', (e) => {
            const nodeId = e.target.id();
            if (this.connectMode) {
                this.handleConnectionClick(nodeId);
            } else {
                this.selectNode(nodeId);
            }
        });

        // Canvas click to clear selection
        this.cy.on('tap', (e) => {
            if (e.target === this.cy) {
                this.cy.nodes().removeClass('selected');
                this.selectedNode = null;
                this.connectMode = null;
                this.firstNode = null;
                this.canvas.style.cursor = 'default';
            }
        });

        // Command bar buttons
        document.getElementById('add-node-btn').addEventListener('click', () => {
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });

        document.getElementById('expand-node-btn').addEventListener('click', () => {
            this.expandNode();
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });

        document.getElementById('edit-node-btn').addEventListener('click', () => {
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });

        document.getElementById('rewrite-node-btn').addEventListener('click', () => {
            this.rewriteNode();
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });

        document.getElementById('approve-node-btn').addEventListener('click', () => {
            this.approveNode();
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });

        document.getElementById('delete-node-btn').addEventListener('click', () => {
            if (this.selectedNode) {
                this.deleteNode(this.selectedNode.id());
            }
        });

        document.getElementById('connect-node-btn').addEventListener('click', () => {
            this.startConnection('strong');
        });

        document.getElementById('disconnect-node-btn').addEventListener('click', () => {
            this.startConnection('disconnect');
        });

        document.getElementById('rewire-all-btn').addEventListener('click', () => {
            this.rewireAll();
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        });
    }

    expandNode() {
        if (this.selectedNode) {
            const newNodeId = `${this.selectedNode.id()}-${Date.now()}`;
            this.addNode({
                id: newNodeId,
                content: `Subnode of ${this.selectedNode.data('content')}`,
                x: this.selectedNode.position('x') + 150,
                y: this.selectedNode.position('y')
            });
            this.addConnection(this.selectedNode.id(), newNodeId, 'strong');
        }
    }

    rewriteNode() {
        if (this.selectedNode) {
            const newContent = `Rewritten: ${this.selectedNode.data('content')}`;
            this.updateNode(this.selectedNode.id(), newContent);
        }
    }

    approveNode() {
        if (this.selectedNode) {
            this.selectedNode.addClass('approved');
        }
    }

    startConnection(mode) {
        if (this.selectedNode) {
            this.connectMode = mode;
            this.firstNode = this.selectedNode;
            this.canvas.style.cursor = 'crosshair';
        } else {
            alert('Please select a node first.');
        }
    }

    handleConnectionClick(targetId) {
        if (this.firstNode && targetId !== this.firstNode.id()) {
            if (this.connectMode === 'disconnect') {
                this.removeConnection(this.firstNode.id(), targetId);
            } else {
                this.addConnection(this.firstNode.id(), targetId, this.connectMode);
            }
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        }
    }

    rewireAll() {
        this.cy.edges().remove();
        const root = this.cy.nodes()[0];
        if (!root) return;
        this.cy.nodes().slice(1).forEach((node, i) => {
            this.addConnection(root.id(), node.id(), i % 2 === 0 ? 'strong' : 'weak');
        });
    }
}

const mindMap = new MindMap('.canvas');

// Override placeholder functions for add-node.js and edit-node.js
window.mapNodeAdd = (content) => {
    const newNodeId = `node-${Date.now()}`;
    mindMap.addNode({
        id: newNodeId,
        content,
        x: Math.random() * (mindMap.canvas.offsetWidth - 100),
        y: Math.random() * (mindMap.canvas.offsetHeight - 50)
    });
};

window.mapGetNode = () => {
    return mindMap.selectedNode?.data('content') || '';
};

window.mapNodeUpdate = (content) => {
    if (mindMap.selectedNode) {
        mindMap.updateNode(mindMap.selectedNode.id(), content);
    }
};

window.mapNodeDelete = () => {
    if (mindMap.selectedNode) {
        mindMap.deleteNode(mindMap.selectedNode.id());
    }
};