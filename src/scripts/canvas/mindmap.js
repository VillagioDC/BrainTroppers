class MindMap {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.connectMode = null;
        this.firstNode = null;
        this.initCanvas();
        this.createExampleNodes();
        this.bindEvents();
    }

    initCanvas() {
        this.canvas.style.position = 'relative';
        this.canvas.style.zIndex = '10';
    }

    createExampleNodes() {
        // Create 3 example nodes
        this.addNode({ id: '1', content: 'Project Core', x: 300, y: 200 });
        this.addNode({ id: '2', content: 'Feature A', x: 450, y: 300 });
        this.addNode({ id: '3', content: 'Feature B', x: 150, y: 300 });

        // Create 2 connections (one strong, one weak)
        this.addConnection('1', '2', 'strong');
        this.addConnection('1', '3', 'weak');
    }

    addNode({ id, content, x, y }) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'mind-map-node';
        nodeElement.id = `node-${id}`;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        nodeElement.innerHTML = content;
        
        this.canvas.appendChild(nodeElement);
        this.nodes.push({ id, content, x, y, element: nodeElement });
        
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.connectMode) {
                this.handleConnectionClick(id);
            } else {
                this.selectNode(id);
            }
        });
    }

    addConnection(fromId, toId, strength = 'strong') {
        this.connections.push({ from: fromId, to: toId, strength });
        this.drawConnections();
    }

    removeConnection(fromId, toId) {
        this.connections = this.connections.filter(
            c => !(c.from === fromId && c.to === toId) && !(c.from === toId && c.to === fromId)
        );
        this.drawConnections();
    }

    selectNode(id) {
        this.nodes.forEach(node => {
            node.element.classList.remove('selected');
        });
        this.selectedNode = this.nodes.find(node => node.id === id);
        if (this.selectedNode) {
            this.selectedNode.element.classList.add('selected');
        }
        this.connectMode = null;
        this.firstNode = null;
        this.canvas.style.cursor = 'default';
    }

    updateNode(id, content) {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            node.content = content;
            node.element.innerHTML = content;
        }
    }

    deleteNode(id) {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            node.element.remove();
            this.nodes = this.nodes.filter(n => n.id !== id);
            this.connections = this.connections.filter(c => c.from !== id && c.to !== id);
            this.drawConnections();
            this.selectedNode = null;
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        }
    }

    drawConnections() {
        // Remove existing SVG
        const existingSvg = this.canvas.querySelector('svg');
        if (existingSvg) existingSvg.remove();

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.class = 'mind-map-connection';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '15';

        this.connections.forEach(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);
            if (fromNode && toNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromNode.x + 50);
                line.setAttribute('y1', fromNode.y + 25);
                line.setAttribute('x2', toNode.x + 50);
                line.setAttribute('y2', toNode.y + 25);
                line.setAttribute('stroke', 'var(--primary)');
                line.setAttribute('stroke-width', '2');
                if (conn.strength === 'weak') {
                    line.classList.add('weak');
                }
                svg.appendChild(line);
            }
        });

        this.canvas.appendChild(svg);
    }

    bindEvents() {
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
            this.deleteNode(this.selectedNode?.id);
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

        // Canvas click to clear selection
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                this.nodes.forEach(node => node.element.classList.remove('selected'));
                this.selectedNode = null;
                this.connectMode = null;
                this.firstNode = null;
                this.canvas.style.cursor = 'default';
            }
        });
    }

    expandNode() {
        if (this.selectedNode) {
            const newNodeId = `${this.selectedNode.id}-${this.nodes.length + 1}`;
            this.addNode({
                id: newNodeId,
                content: `Subnode of ${this.selectedNode.content}`,
                x: this.selectedNode.x + 150,
                y: this.selectedNode.y
            });
            this.addConnection(this.selectedNode.id, newNodeId, 'strong');
        }
    }

    rewriteNode() {
        if (this.selectedNode) {
            const newContent = `Rewritten: ${this.selectedNode.content}`;
            this.updateNode(this.selectedNode.id, newContent);
        }
    }

    approveNode() {
        if (this.selectedNode) {
            this.selectedNode.element.classList.add('approved');
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
        if (this.firstNode && targetId !== this.firstNode.id) {
            if (this.connectMode === 'disconnect') {
                this.removeConnection(this.firstNode.id, targetId);
            } else {
                this.addConnection(this.firstNode.id, targetId, this.connectMode);
            }
            this.connectMode = null;
            this.firstNode = null;
            this.canvas.style.cursor = 'default';
        }
    }

    rewireAll() {
        this.connections = [];
        // Connect nodes in a tree-like structure
        const root = this.nodes[0];
        if (!root) return;
        for (let i = 1; i < this.nodes.length; i++) {
            this.addConnection(root.id, this.nodes[i].id, i % 2 === 0 ? 'strong' : 'weak');
        }
    }
}

const mindMap = new MindMap('.canvas');

// Override placeholder functions from add-node.js and edit-node.js
window.mapNodeAdd = (content) => {
    const newNodeId = `node-${mindMap.nodes.length + 1}`;
    mindMap.addNode({
        id: newNodeId,
        content,
        x: Math.random() * (mindMap.canvas.offsetWidth - 100),
        y: Math.random() * (mindMap.canvas.offsetHeight - 50)
    });
};

window.mapGetNode = () => {
    return mindMap.selectedNode?.content || '';
};

window.mapNodeUpdate = (content) => {
    if (mindMap.selectedNode) {
        mindMap.updateNode(mindMap.selectedNode.id, content);
    }
};

window.mapNodeDelete = () => {
    if (mindMap.selectedNode) {
        mindMap.deleteNode(mindMap.selectedNode.id);
    }
};