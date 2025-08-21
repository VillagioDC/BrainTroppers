(function () {
  class MindMapCanvas {
    constructor(canvasSelector) {
      this.canvas = document.querySelector(canvasSelector);
      if (!this.canvas) throw new Error(`Canvas selector not found: ${canvasSelector}`);

      this.selectedNode = null;
      this.connectMode = null; // 'strong' | 'weak' | 'disconnect'
      this.firstNode = null;

      this.projectId = null;  // project id
      this.nodes = []; // {id, content, detail?, x, y, approved?}
      this.edges = []; // {id, source, target, strength}

      this.gridSpacing = 50;
      this._initD3();
      this._bindCanvasClears();
      this._handleResize(); // Initialize size and bind resize handler
    }

    // ---------- INIT ----------
    _initD3() {
      const css = getComputedStyle(document.documentElement);
      this.background       = css.getPropertyValue('--background').trim()       || '#0a0a0a';
      this.backgroundShadow = css.getPropertyValue('--background-shadow').trim() || '#111';
      this.primary          = css.getPropertyValue('--primary').trim()          || '#4c8bff';
      this.accent           = css.getPropertyValue('--accent').trim()           || '#00d084';
      this.text             = css.getPropertyValue('--text').trim()             || '#eee';
      this.highlight        = css.getPropertyValue('--secondary').trim()        || '#e5428e';

      this.svg = d3.select(this.canvas)
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight);

      // grid
      this.gridG = this.svg.append('g').attr('class', 'dot-grid');
      this._updateDotGrid();

      // zoom/pan
      this.zoom = d3.zoom()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
          this.gridG.attr('transform', event.transform);
          this.g.attr('transform', event.transform);
        });
      this.svg.call(this.zoom);

      // main group
      this.g = this.svg.append('g');

      // forces
      this.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(110))
        .force('charge', d3.forceManyBody().strength(-320))
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.1))
        .force('collide', d3.forceCollide(60).strength(0.5))
        .force('magnetic', this._magneticForce.bind(this));

      // layers
      this.edgesG = this.g.append('g').attr('class', 'edges');
      this.nodesG = this.g.append('g').attr('class', 'nodes');
    }

    _updateDotGrid() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dots = [];
      for (let x = 0; x < width; x += this.gridSpacing) {
        for (let y = 0; y < height; y += this.gridSpacing) dots.push({ x, y });
      }
      const dotSel = this.gridG.selectAll('circle').data(dots);
      dotSel.enter()
        .append('circle')
        .attr('r', 2)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .style('fill', this.primary)
        .style('opacity', 0.1);
      dotSel.exit().remove();
    }

    _handleResize() {
      const updateSize = () => {
        this.svg
          .attr('width', window.innerWidth)
          .attr('height', window.innerHeight);
        this.simulation
          .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
          .alpha(0.1)
          .restart();
        this._updateDotGrid();
      };
      updateSize();
      window.addEventListener('resize', updateSize);
    }

    _magneticForce(alpha) {
      this.nodes.forEach(node => {
        const gx = Math.round(node.x / this.gridSpacing) * this.gridSpacing;
        const gy = Math.round(node.y / this.gridSpacing) * this.gridSpacing;
        node.vx += (gx - node.x) * alpha * 0.1;
        node.vy += (gy - node.y) * alpha * 0.1;
      });
    }

    _bindCanvasClears() {
      // click empty canvas to clear selection & modes
      this.svg.on('click', (event) => {
        if (event.target === this.svg.node()) {
          this.nodesG.selectAll('.node').classed('selected', false);
          this.selectedNode = null;
          this.connectMode = null;
          this.firstNode = null;
          this.canvas.style.cursor = 'default';
        }
      });
      // zoom buttons (present in HTML)
      const zi = document.getElementById('zoom-in');
      const zo = document.getElementById('zoom-out');
      if (zi) zi.addEventListener('click', () => this.svg.transition().call(this.zoom.scaleBy, 1.2));
      if (zo) zo.addEventListener('click', () => this.svg.transition().call(this.zoom.scaleBy, 0.8));
      // command bar buttons that only need canvas state resets
      const resetters = ['add-node-btn','expand-node-btn','edit-node-btn','rewrite-node-btn','approve-node-btn','rewire-all-btn'];
      resetters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => {
          this.connectMode = null;
          this.firstNode = null;
          this.canvas.style.cursor = 'default';
        });
      });
    }

    // ---------- DATA ----------
    // Set data
    setData({ projectId, nodes = [] }) {
      this.projectId = projectId;
      this.nodes = nodes.map(n => ({
        id: n.nodeId,
        content: n.content,
        detail: n.detail || '',
        approved: n.status === 'approved',
        // x and y are optional; if present in future schema updates, include them here (e.g., x: n.x, y: n.y)
      }));

      // Derive edges from schema links (unidirectional in schema, but deduped as undirected pairs)
      const edgeMap = new Map(); // key: `${minId}-${maxId}`, value: strength (prefer 'strong' if any)
      nodes.forEach(n => {
        n.directLink.forEach(t => {
          if (n.nodeId !== t) { // Prevent self-loops
            const min = Math.min(n.nodeId, t);
            const max = Math.max(n.nodeId, t);
            const key = `${min}-${max}`;
            edgeMap.set(key, 'strong'); // Set/override to strong
          }
        });
        n.relatedLink.forEach(t => {
          if (n.nodeId !== t) { // Prevent self-loops
            const min = Math.min(n.nodeId, t);
            const max = Math.max(n.nodeId, t);
            const key = `${min}-${max}`;
            if (!edgeMap.has(key)) {
              edgeMap.set(key, 'weak'); // Set only if not already strong
            }
          }
        });
      });

      // Build edges array
      this.edges = Array.from(edgeMap, ([key, strength]) => {
        const [source, target] = key.split('-');
        return {
          id: `edge-${source}-${target}`,
          source,
          target,
          strength
        };
      });

      this._updateSimulation();
    }
    
    // Remove map
    removeMap() {
      this.projectId = null;
      this.nodes = [];
      this.edges = [];
      this._updateSimulation();
    }

    // ---------- CRUD ----------
    // Add new node
    addNode({ id, content, detail = '', x, y }) {
      this.nodes.push({ id, content, detail, x, y });
      this._updateSimulation();
    }

    // Update node
    updateNode(id, { content, detail, approved }) {
      const n = this.nodes.find(n => n.id === id);
      if (!n) return;
      if (typeof content === 'string') n.content = content;
      if (typeof detail === 'string') n.detail = detail;
      if (typeof approved !== 'undefined') n.approved = !!approved;
      this._updateSimulation();
    }

    // Update node id
    updateNodeId(id, newId) {
      const n = this.nodes.find(n => n.id === id);
      if (!n) return;
      n.id = newId;
      this._updateSimulation();
    }

    // Delete node
    deleteNode(id) {
      this.nodes = this.nodes.filter(n => n.id !== id);
      this.edges = this.edges.filter(e => e.source.id !== id && e.target.id !== id && e.source !== id && e.target !== id);
      if (this.selectedNode?.id === id) this.selectedNode = null;
      this.connectMode = null;
      this.firstNode = null;
      this.canvas.style.cursor = 'default';
      this._updateSimulation();
    }

    // Add connection
    addConnection(fromId, toId, strength = 'strong') {
      const edgeId = `edge-${fromId}-${toId}`;
      // prevent dupes (both directions)
      if (this.edges.some(e => e.id === edgeId || e.id === `edge-${toId}-${fromId}`)) return;
      this.edges.push({ id: edgeId, source: fromId, target: toId, strength });
      this._updateSimulation();
    }

    // Remove connection
    removeConnection(fromId, toId) {
      const e1 = `edge-${fromId}-${toId}`;
      const e2 = `edge-${toId}-${fromId}`;
      this.edges = this.edges.filter(e => e.id !== e1 && e.id !== e2);
      this._updateSimulation();
    }

    // ---------- UI ACTIONS ----------
    // Select node by id
    selectNode(id) {
      this.nodesG.selectAll('.node').classed('selected', false);
      this.edgesG.selectAll('.edge').classed('selected', false);
      this.selectedNode = this.nodes.find(n => n.id === id) || null;
      if (this.selectedNode) {
        this.nodesG.select(`#node-${id}`).classed('selected', true);
        // Highlight edges connected to the selected node
        this.edgesG.selectAll('.edge')
          .filter(d => d.source.id === id || d.target.id === id)
          .classed('selected', true);
      }
      this.connectMode = null;
      this.firstNode = null;
      this.canvas.style.cursor = 'default';
    }

    // Start a connection
    startConnection(mode) {
      if (!this.selectedNode) {
        alert('Please select a node first.');
        return;
      }
      this.connectMode = mode; // 'strong' | 'weak' | 'disconnect'
      this.firstNode = this.selectedNode;
      this.canvas.style.cursor = 'crosshair';
    }

    // Handle a connection click
    handleConnectionClick(targetId) {
      if (this.firstNode && targetId !== this.firstNode.id) {
        if (this.connectMode === 'disconnect') this.removeConnection(this.firstNode.id, targetId);
        else this.addConnection(this.firstNode.id, targetId, this.connectMode || 'strong');

        this.connectMode = null;
        this.firstNode = null;
        this.canvas.style.cursor = 'default';
      }
    }

    // Approve selected
    approveSelected() {
      if (!this.selectedNode) return;
      this.updateNode(this.selectedNode.id, { approved: true });
    }

    // Rewire all
    rewireAll() {
      if (!this.nodes.length) return;
      const root = this.nodes[0];
      this.edges = [];
      this.nodes.slice(1).forEach((n, i) => {
        this.edges.push({ id: `edge-${root.id}-${n.id}`, source: root.id, target: n.id, strength: i % 2 === 0 ? 'strong' : 'weak' });
      });
      this._updateSimulation();
    }

    // ---------- Accessors used by command scripts ----------
    // Get selected node content
    getSelectedContent() {
      return this.selectedNode ? (this.selectedNode.content || '') : '';
    }
    // Get selected node detail
    getSelectedDetail() {
      return this.selectedNode ? (this.selectedNode.detail || '') : '';
    }
    // Set selected node content
    setSelectedContent(content) {
      if (!this.selectedNode) return;
      this.updateNode(this.selectedNode.id, { content });
    }
    // Set selected node detail
    setSelectedDetail(detail) {
      if (!this.selectedNode) return;
      this.updateNode(this.selectedNode.id, { detail });
    }
    // Get project Id
    getProjectId() {
      if (!this) return null;
      return this.projectId;
    }
    // Get selected node id
    getSelectedNodeId() {
      if (!this.selectedNode) return null;
      return this.selectedNode.id;
    }
    // Delete selected node
    deleteSelected() {
      if (!this.selectedNode) return;
      this.deleteNode(this.selectedNode.id);
    }

    // ---------- Render / Simulation ----------
    _updateSimulation() {
      // NODES
      const nodesSel = this.nodesG.selectAll('.node').data(this.nodes, d => d.id);

      const enter = nodesSel.enter()
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
          })
        );

      enter.append('rect')
        .attr('width', 140)
        .attr('height', 56)
        .attr('rx', 10)
        .attr('ry', 10)
        .style('fill', d => d.approved ? this.backgroundShadow : this.background)
        .style('stroke', d => d.approved ? this.accent : this.primary)
        .style('stroke-width', 1);

      enter.append('text')
        .attr('x', 70)
        .attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', this.text)
        .style('font-size', '0.9rem')
        .text(d => d.content);

      // Update existing text/content + approved style
      nodesSel.select('text').text(d => d.content);
      nodesSel.select('rect')
        .style('fill', d => d.approved ? this.backgroundShadow : this.background)
        .style('stroke', d => d.approved ? this.accent : this.primary)
        .style('stroke-width', d => this.selectedNode && this.selectedNode.id === d.id ? 2 : 1);

      // Apply highlighted style to selected nodes
      nodesSel
        .style('stroke', d => this.selectedNode && this.selectedNode.id === d.id ? this.highlight : (d.approved ? this.accent : this.primary))
        .style('stroke-width', d => this.selectedNode && this.selectedNode.id === d.id ? 2 : 1);

      // Node click (bind on both enter and update)
      const setClick = sel => sel.on('click', (event, d) => {
        event.stopPropagation();
        if (this.connectMode) this.handleConnectionClick(d.id);
        else this.selectNode(d.id);
      });
      setClick(enter);
      setClick(nodesSel);

      nodesSel.exit().remove();

      // EDGES
      const edgesSel = this.edgesG.selectAll('.edge').data(this.edges, d => d.id);
      const eEnter = edgesSel.enter()
        .append('line')
        .attr('class', d => `edge mind-map-connection ${d.strength}`)
        .style('stroke', this.primary)
        .style('stroke-width', 2);

      // Update edge styles
      edgesSel
        .style('stroke', d => (this.selectedNode && (d.source.id === this.selectedNode.id || d.target.id === this.selectedNode.id)) ? this.highlight : this.primary)
        .style('stroke-width', d => (this.selectedNode && (d.source.id === this.selectedNode.id || d.target.id === this.selectedNode.id)) ? 2 : 2);

      edgesSel.exit().remove();

      // simulation data
      this.projectId = this.projectId;
      this.simulation.nodes(this.nodes);
      this.simulation.force('link').links(this.edges);
      this.simulation.alpha(1).restart();

      this.simulation.on('tick', () => {
        this.nodesG.selectAll('.node')
          .attr('transform', d => `translate(${(d.x || 0) - 70}, ${(d.y || 0) - 28})`);
        this.edgesG.selectAll('.edge')
          .attr('x1', d => (d.source.x || 0))
          .attr('y1', d => (d.source.y || 0))
          .attr('x2', d => (d.target.x || 0))
          .attr('y2', d => (d.target.y || 0));
      });
    }
  }

  // Expose
  window.MindMapCanvas = MindMapCanvas;

  // Bootstrap a singleton so command scripts can reference it
  window.mindMapCanvas = new MindMapCanvas('.canvas');
})();