class MindMap {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        this.selectedNode = null;
        this.connectMode = null;
        this.firstNode = null;
        this.nodes = [];
        this.edges = [];
        this.gridSpacing = 50; // For magnetic grid
        this.initD3();
        this.createExampleNodes();
        this.bindEvents();
    }

    initD3() {
        // Get CSS variable values
        const rootStyles = getComputedStyle(document.documentElement);
        this.background = rootStyles.getPropertyValue('--background').trim();
        this.backgroundShadow = rootStyles.getPropertyValue('--background-shadow').trim();
        this.primary = rootStyles.getPropertyValue('--primary').trim();
        this.accent = rootStyles.getPropertyValue('--accent').trim();
        this.text = rootStyles.getPropertyValue('--text').trim();
        this.goldPlan = rootStyles.getPropertyValue('--gold-plan').trim();

        // Initialize D3 SVG
        this.svg = d3.select(this.canvas)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');

        // Create dot grid
        this.gridG = this.svg.append('g').attr('class', 'dot-grid');
        this.updateDotGrid();

        // Define zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                this.gridG.attr('transform', event.transform);
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group
        this.g = this.svg.append('g');

        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.canvas.offsetWidth / 2, this.canvas.offsetHeight / 2))
            .force('x', d3.forceX().strength(0.1))
            .force('y', d3.forceY().strength(0.1))
            .force('collide', d3.forceCollide(60).strength(0.5)) // Anti-overlap
            .force('magnetic', this.magneticForce.bind(this)); // Magnetic grid

        // Groups for edges and nodes
        this.edgesG = this.g.append('g').attr('class', 'edges');
        this.nodesG = this.g.append('g').attr('class', 'nodes');
    }

    updateDotGrid() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        const dots = [];

        for (let x = 0; x < width; x += this.gridSpacing) {
            for (let y = 0; y < height; y += this.gridSpacing) {
                dots.push({ x, y });
            }
        }

        const dotSel = this.gridG.selectAll('circle')
            .data(dots);

        dotSel.enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .style('fill', this.primary)
            .style('opacity', 0.1);

        dotSel.exit().remove();
    }

    magneticForce(alpha) {
        this.nodes.forEach(node => {
            const gridX = Math.round(node.x / this.gridSpacing) * this.gridSpacing;
            const gridY = Math.round(node.y / this.gridSpacing) * this.gridSpacing;
            node.vx += (gridX - node.x) * alpha * 0.1;
            node.vy += (gridY - node.y) * alpha * 0.1;
        });
    }

    createExampleNodes() {
        // Add example nodes
        this.addNode({ id: '1', content: 'Project Core', x: 300, y: 200 });
        this.addNode({ id: '2', content: 'Feature A', x: 450, y: 300 });
        this.addNode({ id: '3', content: 'Feature B', x: 150, y: 300 });

        // Add example connections
        this.addConnection('1', '2', 'strong');
        this.addConnection('1', '3', 'weak');

        // Update simulation
        this.updateSimulation();
    }

    addNode({ id, content, x, y }) {
        this.nodes.push({ id, content, x, y });
        this.updateSimulation();
    }

    addConnection(fromId, toId, strength = 'strong') {
        const edgeId = `edge-${fromId}-${toId}`;
        this.edges.push({ id: edgeId, source: fromId, target: toId, strength });
        this.updateSimulation();
    }

    removeConnection(fromId, toId) {
        const edgeId1 = `edge-${fromId}-${toId}`;
        const edgeId2 = `edge-${toId}-${fromId}`;
        this.edges = this.edges.filter(edge => edge.id !== edgeId1 && edge.id !== edgeId2);
        this.updateSimulation();
    }

    selectNode(id) {
        this.nodesG.selectAll('.node').classed('selected', false);
        this.selectedNode = this.nodes.find(node => node.id === id);
        if (this.selectedNode) {
            this.nodesG.select(`#node-${id}`).classed('selected', true);
        }
        this.connectMode = null;
        this.firstNode = null;
        this.canvas.style.cursor = 'default';
    }

    updateNode(id, content) {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            node.content = content;
            this.updateSimulation();
        }
    }

    deleteNode(id) {
        this.nodes = this.nodes.filter(node => node.id !== id);
        this.edges = this.edges.filter(edge => edge.source.id !== id && edge.target.id !== id);
        this.selectedNode = null;
        this.connectMode = null;
        this.firstNode = null;
        this.canvas.style.cursor = 'default';
        this.updateSimulation();
    }

    updateSimulation() {
        // Update nodes
        const nodesSel = this.nodesG.selectAll('.node')
            .data(this.nodes, d => d.id);

        const nodeEnter = nodesSel.enter()
            .append('g')
            .attr('class', 'node mind-map-node')
            .attr('id', d => `node-${d.id}`)
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        nodeEnter.append('rect')
            .attr('width', 100)
            .attr('height', 50)
            .attr('rx', 8)
            .attr('ry', 8)
            .style('fill', this.background)
            .style('fill-opacity', 1)
            .style('stroke', this.primary)
            .style('stroke-width', 1);

        nodeEnter.append('text')
            .attr('x', 50)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', this.text)
            .style('font-size', '0.9rem')
            .text(d => d.content);

        nodesSel.select('text')
            .text(d => d.content);

        nodesSel.exit().remove();

        // Update edges
        const edgesSel = this.edgesG.selectAll('.edge')
            .data(this.edges, d => d.id);

        const edgeEnter = edgesSel.enter()
            .append('line')
            .attr('class', d => `edge mind-map-connection ${d.strength}`)
            .style('stroke', this.primary)
            .style('stroke-width', 2);

        edgesSel.exit().remove();

        // Update simulation
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.edges);
        this.simulation.alpha(1).restart();

        // Update node positions and styles
        this.simulation.on('tick', () => {
            this.nodesG.selectAll('.node')
                .attr('transform', d => `translate(${d.x - 50}, ${d.y - 25})`);

            this.edgesG.selectAll('.edge')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        });

        // Apply styles for selected and approved nodes
        this.nodesG.selectAll('.node')
            .style('fill', d => d.approved ? this.backgroundShadow : this.background)
            .style('stroke', d => d.approved ? this.accent : this.primary);
    }

    bindEvents() {
        // Node click handling
        this.nodesG.selectAll('.node')
            .on('click', (event, d) => {
                if (this.connectMode) {
                    this.handleConnectionClick(d.id);
                } else {
                    this.selectNode(d.id);
                }
            });

        // Canvas click to clear selection
        this.svg.on('click', (event) => {
            if (event.target === this.svg.node()) {
                this.nodesG.selectAll('.node').classed('selected', false);
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
                this.deleteNode(this.selectedNode.id);
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
            const newNodeId = `${this.selectedNode.id}-${Date.now()}`;
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
            this.selectedNode.approved = true;
            this.updateSimulation();
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
        this.edges = [];
        const root = this.nodes[0];
        if (!root) return;
        this.nodes.slice(1).forEach((node, i) => {
            this.addConnection(root.id, node.id, i % 2 === 0 ? 'strong' : 'weak');
        });
        this.updateSimulation();
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