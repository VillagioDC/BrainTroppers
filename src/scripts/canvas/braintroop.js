// braintroop.js (rewritten & completed)
// BrainTroop Interactive Mind Map Canvas using D3.js v7
// Local storage key: 'braintroop_map'

(function () {
  // Require d3 v7
  if (typeof d3 === "undefined") {
    throw new Error("d3.js v7 is required by braintroop.js");
  }

  class braintroop {
    // Constructor accepts canvas selector (default '#canvas')
    constructor(canvasSelector = "#canvas") {
      // -------------------- CORE CONFIG --------------------
      // Canvas DOM element
      this.canvas = document.querySelector(canvasSelector);
      if (!this.canvas) throw new Error(`Canvas element not found: ${canvasSelector}`);

      // Hide overflow so user pans to navigate the canvas
      this.canvas.style.overflow = "hidden";

      // Backend-scheme map key stored in localStorage
      // Backend schema: { projectId, owner, colabs[{email, userId}], userPrompt, title, lastUpdated, nodes [{nodeId, shortName, content, detail, status, directLink, relatedLink, xy, hidden, colorScheme, layer }] }
      this.mapKey = "braintroop-map";

      // Grid and sizing defaults
      this.gridSpacing = 50;               // modular grid spacing
      this.nodeWidth = 146;                // default node width (grid modular)
      this.nodeHeight = 46;                // default node height
      this.hiddenNodeWidth = 30;           // when hidden, smaller shape
      this.hiddenNodeHeight = 30;
      this.nodeSnapOffset = { x: this.nodeWidth / 2, y: this.nodeHeight / 2 };

      // Palette structure
      this.palette = {
        dark: {
          canvas: { bg: "#111111", gridDot: "#444444" },
          node: { fill: "#1f1f1f", stroke: "#aaaaaa", text: "#ffffff", selected: "#ff4444" },
          edge: { stroke: "#aaaaaa", strokeSelected: "#ff4444", style: "solid" }
        },
        light: {
          canvas: { bg: "#ffffff", gridDot: "#cccccc" },
          node: { fill: "#f0f0f0", stroke: "#777777", text: "#222222", selected: "#ff0000" },
          edge: { stroke: "#888888", strokeSelected: "#ff0000", style: "solid" }
        }
      };

      // Preset color schemes for nodes
      this.colorSchemes = {
        ocean: { fill: "#0077be", stroke: "#004d73", strokeSelected: "#00bfff", text: "#ffffff" },
        sunset: { fill: "#ff7043", stroke: "#e64a19", strokeSelected: "#ffab91", text: "#ffffff" },
        forest: { fill: "#388e3c", stroke: "#1b5e20", strokeSelected: "#66bb6a", text: "#ffffff" },
        city: { fill: "#9e9e9e", stroke: "#424242", strokeSelected: "#bdbdbd", text: "#ffffff" }
      };

      // Theme state (dark or light)
      this.currentTheme = "dark";
      this.currentColorScheme = "ocean"; // default node color scheme

      // Current layer index for toggles
      this.currentLayer = 0;

      // In-memory canvas map model
      // nodes: [ { id, parentId, shortName, content, detail, x, y, locked, layer, colorSchemeName, hidden } ]
      // edges: [ { id, source, target, type } ]
      this.map = { nodes: [], edges: [] };
      this.backendMeta = {};

      // Render and interaction state
      this.selected = { type: null, id: null }; // selection tracker
      this._pendingConnectionFrom = null; // for connection workflow

      // D3 selections and simulation placeholders (created in _initD3)
      this.svg = null;
      this.g = null;
      this.gridG = null;
      this.edgesG = null;
      this.nodesG = null;
      this.selectionRect = null;
      this.simulation = null;
      this.zoom = null;

      // Initialize D3 elements and forces
      this._initD3();

      // Load backend map from localStorage -> convert to canvas model
      this._loadMapFromStorage();

      // Initial render (forceFull true to ensure initial creating)
      this.updateMap(true);

      // Keep grid & center updated on resize
      window.addEventListener("resize", () => this._onResize());

    }

    // -------------------- PRIVATE: D3 INIT --------------------
    _initD3() {
      // Clear existing canvas contents
      this.canvas.innerHTML = "";

      // Create an <svg> element that fills the container
      this.svg = d3.select(this.canvas)
        .append("svg")
        .attr("id", "braintroop-svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("display", "block")
        .style("background", this.palette[this.currentTheme].canvas.bg)
        .style("cursor", "grab");

      // Root group for pan/zoom transforms
      this.g = this.svg.append("g").attr("class", "root-g");

      // Grid group for dotted grid
      this.gridG = this.g.append("g").attr("class", "dot-grid");
      this._updateDotGrid();

      // Groups for edges and nodes
      this.edgesG = this.g.append("g").attr("class", "edges");
      this.nodesG = this.g.append("g").attr("class", "nodes");

      // Selection rectangle (visual rectangular-square-border used to highlight selected node)
      this.selectionRect = this.nodesG.append("rect")
        .attr("class", "selection-rect")
        .attr("rx", 0)
        .attr("ry", 0)
        .style("fill", "none")
        .style("stroke", this.palette[this.currentTheme].node.selected)
        .style("stroke-width", 1)
        .style("pointer-events", "none")
        .style("display", "none");

      // D3 zoom with start/zoom/end handlers; adjust cursor while panning
      this.zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on("start", (event) => {
          // Cursor feedback during pan/zoom
          this.svg.style("cursor", "grabbing");
        })
        .on("zoom", (event) => {
          // Apply transform to root group (grid, edges, nodes)
          this.g.attr("transform", event.transform);
        })
        .on("end", (event) => {
          // Restore cursor after pan/zoom ends
          this.svg.style("cursor", "grab");
        });

      // Call zoom behaviour on svg
      this.svg.call(this.zoom);

      // Background click clears selection and cancels pending connection (UX)
      this.svg.on("click", (ev) => {
        // Only clear selection if user clicked on empty space (not on nodes/edges)
        // Node/edge handlers call stopPropagation; so this will only trigger on background.
        this._setSelected(null, null);
        this.cancelPendingConnection();
      });

      // Force simulation: link/connect, charge, collide and a magnetic custom force
      this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(160).strength(0.8))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("collide", d3.forceCollide(Math.max(this.nodeWidth, this.nodeHeight) * 0.6).strength(0.9))
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force("magnetic", this._magneticForce.bind(this)); // custom magnetic snapping
    }

    // -------------------- PRIVATE: GRID --------------------
    // Draw dotted grid to match viewport
    _updateDotGrid() {
      // Compute approximate visible area
      const bbox = this.canvas.getBoundingClientRect();
      const width = Math.max(bbox.width, window.innerWidth);
      const height = Math.max(bbox.height, window.innerHeight);

      // Build dots array (coarse but performant)
      const dots = [];
      for (let gx = 0; gx <= width; gx += this.gridSpacing) {
        for (let gy = 0; gy <= height; gy += this.gridSpacing) {
          dots.push({ x: gx, y: gy });
        }
      }

      // Bind dots and render as small circles
      const sel = this.gridG.selectAll("circle.grid-dot").data(dots, d => `${d.x},${d.y}`);
      sel.enter()
        .append("circle")
        .attr("class", "grid-dot")
        .attr("r", 1.2)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("fill", this.palette[this.currentTheme].canvas.gridDot)
        .style("opacity", 0.7);
      sel.exit().remove();
    }

    // -------------------- PRIVATE: CUSTOM FORCE --------------------
    // Magnetic snapping force: attracts "free" nodes toward nearest grid intersection
    _magneticForce(alpha) {
      if (!this.map.nodes) return;
      // Only affect nodes that are free === true (respond to magnets)
      this.map.nodes.forEach(node => {
        const n = node.__d3node; // reference to simulation node object
        if (!n) return;
        if (n.locked === false) return; // fixed nodes do not respond to magnets
        // compute nearest grid point (snap target)
        const gx = Math.round(n.x / this.gridSpacing) * this.gridSpacing;
        const gy = Math.round(n.y / this.gridSpacing) * this.gridSpacing;
        // apply a gentle pull toward the grid point
        n.vx += (gx - n.x) * 0.05 * alpha;
        n.vy += (gy - n.y) * 0.05 * alpha;
      });
    }

    // -------------------- PRIVATE: STORAGE --------------------
    // Load from localStorage into this.map
    _loadMapFromStorage() {
      const raw = localStorage.getItem(this.mapKey);
      if (!raw) {
        // No stored map: create empty canvas map
        this.map = { nodes: [], edges: [] };
        return;
      }
      try {
        // Parse raw backend map (we will convert below)
        const parsed = JSON.parse(raw);
        // Convert the backend schema into our canvas-friendly map schema
        this.map = this._convertMapToCanvas(parsed);
      } catch (err) {
        console.error("braintroop: failed to parse stored map", err);
        // On parse error, reset map to empty
        this.map = { nodes: [], edges: [] };
      }
    }

    // Save this.map (canvas model) to localStorage backend map
    _saveMapToStorage() {
      try {
        // Convert canvas map to backend schema and persist
        const backendMap = this._convertMapToBackend();
        localStorage.setItem(this.mapKey, JSON.stringify(backendMap));
      } catch (err) {
        console.error("braintroop: failed to save map to storage", err);
      }
    }

    // Convert backend map to canvas map
    _convertMapToCanvas(backendMap) {
      //Check map
      if (!backendMap || typeof backendMap !== "object") {
        return { nodes: [], edges: [] };
      }
      // Preserve backend metadata separately (for round-trip conversion)
      this.backendMeta = {
        projectId: backendMap.projectId || null,
        owner: backendMap.owner || null,
        colabs: Array.isArray(backendMap.colabs) ? backendMap.colabs : [],
        userPrompt: backendMap.userPrompt || "",
        title: backendMap.title || "",
        lastUpdated: backendMap.lastUpdated || null
      };

      // Convert map
      const nodes = [];
      const edges = [];

      // Normalize backend nodes into canvas nodes
      if (Array.isArray(backendMap.nodes)) {
        backendMap.nodes.forEach((n, idx) => {
          const id = n.nodeId || `node_${Date.now()}_${idx}`;
          const parentId = n.parentId || null;
          const shortName = n.shortName || "";
          const content = n.content || "";
          const detail = n.detail || "";
          const status = n.status || "pending";
          const colorSchemeName = n.colorScheme || this.currentColorScheme;
          const layer = typeof n.layer === "number" ? n.layer : 0;
          const hidden = !!n.hidden;

          // Parse xy position into numeric x,y and detect locked nodes
          let x = null, y = null, nodeXY = "";
          if (typeof n.xy === "string" && n.xy.includes(",")) {
            nodeXY = n.xy;
            const parts = nodeXY.split(",").map(p => parseFloat(p));
            if (!isNaN(parts[0]) && !isNaN(parts[1])) {
              x = parts[0];
              y = parts[1];
            }
          }
          const locked = !!n.locked;

          // Create normalized canvas node
          nodes.push(this._normalizeNode({
            id,
            parentId,
            shortName,
            content,
            detail,
            status,
            x,
            y,
            locked,
            layer,
            colorSchemeName,
            hidden,
          }));

          // If no coordinates at all, center the first node
            if (nodes.length > 0) {
              const hasAnyXY = nodes.some(n => typeof n.x === "number" && typeof n.y === "number");
              if (!hasAnyXY) {
                nodes[0].x = window.innerWidth / 2;
                nodes[0].y = window.innerHeight / 2;
                nodes[0].locked = true;
              }
            }

          // Build directLink edges
          if (Array.isArray(n.directLink)) {
            n.directLink.forEach(targetId => {
              if (targetId) {
                // Prevent bidirectional edges
                if (edges.find(e => e.source === targetId && e.target === id)) return;
                // Push edge
                edges.push(this._normalizeEdge({
                  id: `edge-${id}-${targetId}`,
                  source: id,
                  target: targetId,
                  type: "direct"
                }));
              }
            });
          }

          // Build relatedLink edges
          if (Array.isArray(n.relatedLink)) {
            n.relatedLink.forEach(targetId => {
              if (targetId) {
                // Prevent bidirectional edges
                if (edges.find(e => e.source === targetId && e.target === id)) return;
                // Push edge
                edges.push(this._normalizeEdge({
                  id: `edge-${id}-${targetId}-related`,
                  source: id,
                  target: targetId,
                  type: "related"
                }));
              }
            });
          }
        });
      }
      // Return canvas model map
      return { nodes, edges };
    }

    // Convert canvas map to backend map
    _convertMapToBackend() {
      // Build lookup for edges
      const directLinks = {};
      const relatedLinks = {};
      // Loop all edges
      (canvas.edges || []).forEach(e => {
        if (!e.source || !e.target) return;
        // Direct links
        if (e.type === "direct") {
          // Create bidirecional links
          if (!directLinks[e.source]) directLinks[e.source] = []; // initialize array
          directLinks[e.source].push(e.target);
          if (!directLinks[e.target]) directLinks[e.target] = []; // initialize array
          directLinks[e.target].push(e.source);
        // Related links
        } else {
          // Create bidirecional links
          if (!relatedLinks[e.source]) relatedLinks[e.source] = [];
          relatedLinks[e.source].push(e.target);
          if (!relatedLinks[e.target]) relatedLinks[e.target] = [];
          relatedLinks[e.target].push(e.source);
        }
      });

      // Convert canvas nodes to backend nodes
      const nodes = (this.map.nodes || []).map(n => {
        // Always store xy as "x,y" string or null if free
        let xy = null;
        if (typeof n.x === "number" && typeof n.y === "number") {
          xy = `${Math.round(n.x)},${Math.round(n.y)}`;
        } else if (typeof n.nodeXY === "string" && n.nodeXY.includes(",")) {
          xy = n.nodeXY;
        }

        return {
          nodeId: n.id,
          shortName: n.shortName || "",
          content: n.content || "",
          detail: n.detail || "",
          status: n.status || "pending",
          directLink: directLinks[n.id] || [],
          relatedLink: relatedLinks[n.id] || [],
          xy,
          hidden: !!n.hidden,
          colorScheme: n.colorSchemeName || this.currentColorScheme,
          layer: typeof n.layer === "number" ? n.layer : 0
        };
      });

      // Rebuild full backend schema with preserved metadata
      return {
        projectId: this.backendMeta?.projectId || null,
        owner: this.backendMeta?.owner || null,
        colabs: Array.isArray(this.backendMeta?.colabs) ? this.backendMeta.colabs : [],
        userPrompt: this.backendMeta?.userPrompt || "",
        title: this.backendMeta?.title || "",
        lastUpdated: new Date(),
        nodes
      };
    }

    // -------------------- PUBLIC API --------------------
    // Replace entire map and render
    setMap(map) {
      // Check map
      if (!map) return;
        this.map = this._convertMapToCanvas(map);
      // Update full map on canvas
      this.updateMap(true);
    }

    // Delete entire map
    deleteMap() {
      // Delete canvas map
      this.map = { nodes: [], edges: [] };
      // Update canvas
      this.updateMap(true);
      // reset selection
      this._setSelected(null, null);
    }

    // Reads the local storage backend map, converts to canvas map and rebuilds
    // parameter `forceFull` instructs to fully rebuild bindings if needed
    updateMap(forceFull = false) {
      // Load canvas map from local storage backend map
      this._loadMapFromStorage();
      // Quick bail if nothing changed? Here we always diff-bind (optimized enough).
      this._bindEdgesAndNodes(forceFull);
      // Persist map changes after any conversions
      this._saveMapToStorage();
    }

    // Add a node connected to selected node
    // Accepts object: { id: string, content: string, layer: int, colorSchemeName: string, nodeXY: "x,y" (optional), locked: boolean }
    addNode({ parentId, id, shortName = "", content = "", detail = "", nodeXY = null, locked = false, layer = 0, colorSchemeName = this.currentColorScheme } = {}) {
      // Check parentId
      if (!parentId) return;

      // If missing id, generate one
      if (!id) id = `temp_${Date.now()}_${Math.floor(Math.random() * 99)}`;

      // Determine initial coords: first node center, others random
      let x = null, y = null;
      if (nodeXY && typeof nodeXY === "string" && nodeXY.contains(",")) {
        const parts = nodeXY.split(",").map(p => parseFloat(p));
        x = parts[0]; y = parts[1];
      } else {
        if (this.map.nodes.length === 0) {
          // first node exactly at center
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
        } else {
          // random-ish position near parent node
          const parentNode = this.map.nodes.find(n => n.id === parentId);
          const parentX = parentNode.x;
          const parentY = parentNode.y;
          x = Math.round(parentX + (Math.random() - 0.5) * this.nodeWidth);
          y = Math.round(parentY + (Math.random() - 0.5) * this.nodeHeight);
        }
      }

      // All nodes are unlocked by default, except first node
      locked = false;
      if (this.map.nodes.length === 0) locked = true;

      // Construct node
      const node = {
        id,
        parentId,
        shortName,
        content,
        detail,
        x,
        y,
        locked,
        colorSchemeName,
        layer: typeof layer === "number" ? layer : this.currentLayer,
        hidden: false     // visible by default
      };
      // Push node
      this.map.nodes.push(this._normalizeNode(node));
      // Persist and refresh
      this._saveMapToStorage();
      this.updateMap();
      // Return node id (temporary id)
      return node.id;
    }

    // Connect two nodes: frontend will call setConnection(nodeFrom, nodeTo)
    // Edge type: 'direct' (solid) or 'related' (dash)
    setConnection(nodeFromId, nodeToId, type = "direct") {
      if (!nodeFromId || !nodeToId) return;
      const edgeId = `edge-${nodeFromId}-${nodeToId}`;
      // Avoid duplicates
      if (this.map.edges.some(e => e.id === edgeId)) return;
      const edge = {
        id: edgeId,
        source: nodeFromId,
        target: nodeToId,
        type: type === "related" ? "related" : "direct"
      };
      // Push edge
      this.map.edges.push(this._normalizeEdge(edge));
      // Persist and refresh
      this._saveMapToStorage();
      this.updateMap();
    }

    // Toggle theme (dark/light)
    setTheme(themeName) {
      if (!this.palette[themeName]) return;
      this.currentTheme = themeName;
      // Update background and grid dot colors
      this.svg.style("background", this.palette[this.currentTheme].canvas.bg);
      this._updateDotGrid();
      // Update arrow marker color
      this.svg.select("defs marker#arrow path").attr("fill", this.palette[this.currentTheme].edge.stroke);
      // Repaint nodes/edges
      this.updateMap(true);
    }

    // Set color scheme for a node by name
    setColorScheme(nodeId, schemeName) {
      // Find node
      const node = this.map.nodes.find(n => n.id === nodeId);
      if (!node) return;
      // Set color scheme
      if (!this.colorSchemes[schemeName]) schemeName = this.currentColorScheme;
      // Apply
      node.colorSchemeName = schemeName;
      // Update color scheme
      this.currentColorScheme = schemeName;
      // Persisted and refreshed
      this._saveMapToStorage();
      this.updateMap();
    }

    // Toggle hide/show of nodes of a layer and below
    // layerId numeric. Nodes with layer >= layerId will be toggled hidden=true/false
    toggleLayer(layerId) {
      if (typeof layerId !== "number") return;
      // determine new state (flip for nodes of that layer group)
      // We'll flip individually for nodes at/above layerId
      this.map.nodes.forEach(n => {
        if (n.layer >= layerId) n.hidden = !n.hidden;
      });
      // Persist and refresh
      this._saveMapToStorage();
      this.updateMap();
    }

    // Export - export canvas as PNG or SVG
    // type: 'png' | 'svg'
    export(type = "png") {
      // Check content
      if (this.map.nodes.length === 0) return;

      // Fallback: convert SVG to PNG by drawing onto canvas for png
      const svgNode = this.svg.node();
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgNode);

      // Base filename
      const raw = localStorage.getItem(this.mapKey);
      const mapTitle = JSON.parse(raw).title;
      const filename = `Braintroop_${mapTitle}_${Date.now()}`;
      // SVG conversion
      if (type === "svg") {
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // PNG conversion
      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      const url = 'data:image/svg+xml;base64,' + svg64;
      img.onload = () => {
        const canvasEl = document.createElement("canvas");
        // compute bounding box of svg element
        const bbox = svgNode.getBoundingClientRect();
        canvasEl.width = bbox.width * 2; // hi-dpi
        canvasEl.height = bbox.height * 2;
        const ctx = canvasEl.getContext("2d");
        ctx.fillStyle = this.palette[this.currentTheme].canvas.bg;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        // draw
        ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
        // download
        canvasEl.toBlob(blob => {
          const url2 = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url2;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url2);
        });
      };
      img.src = url;
    }

    // -------------------- EVENTS EMISSION (only two events) --------------------
    // Emit 'select' with { nodeId, edgeId } where one is non-null
    _emitSelect(nodeId = null, edgeId = null) {
      // update internal selected state
      if (nodeId) {
        this.selected = { type: "node", id: nodeId };
      } else if (edgeId) {
        this.selected = { type: "edge", id: edgeId };
      } else {
        this.selected = { type: null, id: null };
      }
      // dispatch only this custom event for frontend
      this.canvas.dispatchEvent(new CustomEvent("select", { detail: { nodeId: nodeId || null, edgeId: edgeId || null } }));
      // update visual selection rectangle / edge highlight
      this._paintSelection();
    }

    // Emit 'nodeMove' after a node has been dragged & dropped and persisted
    _emitNodeMove(nodeId, nodeXY) {
      this.canvas.dispatchEvent(new CustomEvent("nodeMove", { detail: { nodeId, nodeXY } }));
    }

    // Convenience to set selection programmatically
    _setSelected(type, id) {
      if (type === "node") this._emitSelect(id, null);
      else if (type === "edge") this._emitSelect(null, id);
      else this._emitSelect(null, null);
    }

    // -------------------- PRIVATE: BINDING NODES & EDGES --------------------
    // Transform this.map into D3 nodes/links and bind enter/update/exit
    _bindEdgesAndNodes(forceFull = false) {
      // Build lookup map for quick referencing
      const nodeById = new Map();
      (this.map.nodes || []).forEach(n => { nodeById.set(n.id, n); });

      // IMPORTANT: include hidden nodes in simulation (so they remain positioned),
      // but render them with a special small shape. So we don't filter them out.
      const allNodes = this.map.nodes || [];

      // Prepare simulation nodes (attach __mapNode reference)
      const simNodes = allNodes.map(n => {
        // parse node.nodeXY string if present to numeric positions
        let x = null, y = null;
        if (typeof n.nodeXY === "string" && n.nodeXY.includes(",")) {
          const parts = n.nodeXY.split(",").map(p => parseFloat(p));
          if (!isNaN(parts[0])) x = parts[0];
          if (!isNaN(parts[1])) y = parts[1];
        }
        // fallback to explicit x,y if provided
        if ((x === null || y === null) && typeof n.x === "number" && typeof n.y === "number") {
          x = n.x; y = n.y;
        }

        return {
          id: n.id,
          x: x !== null ? x : (window.innerWidth / 2 + (Math.random() - 0.5) * 200),
          y: y !== null ? y : (window.innerHeight / 2 + (Math.random() - 0.5) * 200),
          __mapNode: n
        };
      });

      // Prepare edges - include edges connecting to existing nodes only
      const simEdges = (this.map.edges || [])
        .filter(e => nodeById.has(e.source) && nodeById.has(e.target))
        .map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || "direct",
          __mapEdge: e
        }));

      // Update the simulation graph
      this.simulation.nodes(simNodes);
      this.simulation.force("link").links(simEdges);

      // Keep references back on map nodes so forces and drag can sync
      simNodes.forEach(n => {
        n.__mapNode.__d3node = n;
      });

      // ----------------- EDGES BIND -----------------
      const edgesSel = this.edgesG.selectAll("g.edge-group").data(simEdges, d => d.id);

      // ENTER edges
      const eEnter = edgesSel.enter()
        .append("g")
        .attr("class", "edge-group")
        .attr("data-edge-id", d => d.id);

      // visible line
      eEnter.append("line")
        .attr("class", "edge-line")
        .attr("stroke-width", 1)
        .style("pointer-events", "stroke")
        .style("fill", "none");

      // hit region (thicker transparent stroke) for easier clicks
      eEnter.append("line")
        .attr("class", "edge-hit")
        .attr("stroke-width", 12)
        .style("stroke", "transparent")
        .style("pointer-events", "stroke");

      // Edge click -> select edge (stop propagation so background click doesn't clear)
      this.edgesG.selectAll("g.edge-group").selectAll(".edge-hit")
        .on("click", (event, d) => {
          event.stopPropagation();
          this._setSelected("edge", d.id);
        });

      // EXIT edges cleanup
      edgesSel.exit().remove();

      // Update edge styling after enter/update
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const gEl = d3.select(nodes[i]);
        const line = gEl.select(".edge-line");
        // dashed style for related edges
        if (d.type === "related") line.style("stroke-dasharray", "6,6");
        else line.style("stroke-dasharray", null);

        // set marker only for direct edges (arrow)
        if (d.type === "direct") line.attr("marker-end", "url(#arrow)");
        else line.attr("marker-end", null);

        // highlight selected edge
        if (this.selected.type === "edge" && this.selected.id === d.id) {
          line.style("stroke", this.palette[this.currentTheme].edge.strokeSelected);
        } else {
          line.style("stroke", this.palette[this.currentTheme].edge.stroke);
        }
      });

      // ----------------- NODES BIND -----------------
      // Data join: each node group will hold a rect + text (we'll shrink rect for hidden nodes)
      const nodesSel = this.nodesG.selectAll("g.node-group").data(simNodes, d => d.id);

      // ENTER new nodes
      const nodeEnter = nodesSel.enter()
        .append("g")
        .attr("class", "node-group")
        .attr("data-node-id", d => d.id)
        // Make nodes draggable (drag start -> drag -> end)
        .call(d3.drag()
          .on("start", (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0.2).restart();
            // nothing else - don't auto-fix during drag; we commit on end
          })
          .on("drag", (event, d) => {
            // Move the simulated node to the pointer location
            d.x = event.x;
            d.y = event.y;
            // Immediate visual update while dragging
            d3.select(event.subject.__containerNode).attr("transform", `translate(${d.x - this.nodeWidth / 2}, ${d.y - this.nodeHeight / 2})`);
            this._tickUpdatePositions();
          })
          .on("end", (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0);
            // Snap to grid on drop
            const snappedX = Math.round(d.x / this.gridSpacing) * this.gridSpacing;
            const snappedY = Math.round(d.y / this.gridSpacing) * this.gridSpacing;
            d.x = snappedX; d.y = snappedY;

            // Persist new nodeXY and mark node as fixed (free=false) (F15)
            const mapNode = d.__mapNode;
            mapNode.nodeXY = `${Math.round(d.x)},${Math.round(d.y)}`;
            mapNode.x = d.x; mapNode.y = d.y;
            mapNode.free = false; // no longer respond to magnets

            // Persist and emit move event
            this._saveMapToStorage();
            this._emitNodeMove(mapNode.id, mapNode.nodeXY);

            // Update simulation so other nodes react
            this.updateMap();
          })
        );

      // Attach container node reference (used in drag)
      nodeEnter.each((d, i, nodes) => {
        d.__containerNode = nodes[i];
      });

      // Append rect and text inside node group
      nodeEnter.append("rect")
        .attr("class", "node-rect")
        .attr("rx", 10)
        .attr("ry", 10)
        .style("stroke-width", 1)
        .style("cursor", "pointer");

      nodeEnter.append("text")
        .attr("class", "node-text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("pointer-events", "none")
        .style("user-select", "none");

      // Node click -> selection or pending connection handling
      this.nodesG.selectAll("g.node-group")
        .on("click", (event, d) => {
          event.stopPropagation();
          const mapNode = d.__mapNode;
          // If a connection is pending, create connection from pending node to this node
          if (this._pendingConnectionFrom) {
            const fromId = this._pendingConnectionFrom;
            const toId = mapNode.id;
            this.setConnection(fromId, toId, "direct");
            this._pendingConnectionFrom = null;
            // Select the node after connecting
            this._setSelected("node", mapNode.id);
            return;
          }
          // Normal selection of node
          this._setSelected("node", mapNode.id);
        });

      // UPDATE (applies to both new and existing nodes)
      const allNodeGroups = this.nodesG.selectAll("g.node-group");
      allNodeGroups.each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;

        // Determine dimension based on hidden state
        const w = mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth;
        const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;

        // Determine border radius based on hidden state
        const borderRadius = mapNode.hidden ? Math.min(w, h) / 2 : 10;

        // Compute color scheme or use theme defaults
        const scheme = this.colorSchemes[mapNode.colorSchemeName] || null;
        const fill = scheme ? scheme.fill : this.palette[this.currentTheme].node.fill;
        const stroke = scheme ? scheme.stroke : this.palette[this.currentTheme].node.stroke;
        const strokeSelected = scheme ? scheme.strokeSelected : this.palette[this.currentTheme].node.selected;
        const textColor = scheme ? scheme.text : this.palette[this.currentTheme].node.text;

        // Update rect size & corner radius (hidden nodes become circular-ish)
        g.select(".node-rect")
          .attr("width", w)
          .attr("height", h)
          .attr("rx", borderRadius)
          .attr("ry", borderRadius)
          .style("fill", fill)
          .style("stroke", (this.selected.type === "node" && this.selected.id === mapNode.id) ? strokeSelected : stroke);

        // Update text: show '+' sign if hidden, otherwise content; adjust font size
        const nodeText = mapNode.hidden ? "+" : (mapNode.content || "");
        g.select(".node-text")
          .attr("x", w / 2)
          .attr("y", h / 2)
          .style("fill", textColor)
          .style("font-size", mapNode.hidden ? "1.2rem" : "0.9rem")
          .text(nodeText);

        // Position group so that the rect is centered at d.x,d.y (snap to center of current dims)
        g.attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
      });

      // EXIT cleanup for nodes
      nodesSel.exit().remove();

      // ----------------- SIMULATION TICK -----------------
      // On each tick update positions of node groups and edges positions
      this.simulation.on("tick", () => {
        // Update each node group's transform (centered)
        this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
          // compute width/height based on hidden state
          const mapNode = d.__mapNode;
          const w = mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth;
          const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;
          d3.select(nodes[i]).attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
        });

        // Update edges endpoints to simulation nodes' coordinates (center)
        this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
          const g = d3.select(nodes[i]);
          const line = g.select(".edge-line");
          // d.source and d.target are sim node objects
          line.attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
          // update hit line coordinates as well
          g.select(".edge-hit").attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
        });
      });

      // Kick simulation a bit to settle layout
      this.simulation.alpha(0.8).restart();

      // Paint selection visual after binding
      this._paintSelection();
    }

    // Helper: update positions instantly (used during drag)
    _tickUpdatePositions() {
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const mapNode = d.__mapNode;
        const w = mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth;
        const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;
        d3.select(nodes[i]).attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
      });
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const line = g.select(".edge-line");
        line.attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
        g.select(".edge-hit").attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
      });
    }

    // -------------------- PRIVATE: UTILS & NORMALIZATIONS --------------------
    // Normalize node object shape and set defaults. Also ensures numeric x,y if possible.
    _normalizeNode(n) {
      // parse nodeXY into x,y numbers if available
      let nodeXY = "";
      if (n && typeof n.nodeXY === "string") nodeXY = n.nodeXY;
      else if (n && typeof n.nodeXY === "object" && n.nodeXY.x !== undefined && n.nodeXY.y !== undefined) nodeXY = `${n.nodeXY.x},${n.nodeXY.y}`;
      else if (!n.nodeXY && n.x && n.y) nodeXY = `${n.x},${n.y}`;

      let x = null, y = null;
      if (typeof nodeXY === "string" && nodeXY.includes(",")) {
        const parts = nodeXY.split(",").map(p => parseFloat(p));
        if (!isNaN(parts[0])) x = parts[0];
        if (!isNaN(parts[1])) y = parts[1];
      } else {
        if (typeof n.x === "number") x = n.x;
        if (typeof n.y === "number") y = n.y;
      }

      return {
        id: String(n.id),
        content: n.content || "",
        // store canonical nodeXY as string if possible
        nodeXY: (typeof nodeXY === "string" ? nodeXY : (x !== null && y !== null ? `${Math.round(x)},${Math.round(y)}` : "")),
        // numeric coordinates (might be null)
        x: (typeof x === "number" ? x : null),
        y: (typeof y === "number" ? y : null),
        free: typeof n.free === "boolean" ? n.free : true,
        layer: typeof n.layer === "number" ? n.layer : 0,
        colorSchemeName: n.colorSchemeName || n.colorScheme || "ocean",
        hidden: !!n.hidden,
        parentId: n.parentId || n.parent || null
      };
    }

    // Normalize edge object
    _normalizeEdge(e) {
      return {
        id: e.id || `edge-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: e.type === "related" ? "related" : "direct"
      };
    }

    // -------------------- PRIVATE: VISUAL SELECTION RENDERING --------------------
    // Paint selection visuals (rect around node or highlight selected edge)
    _paintSelection() {
      // Set edge stroke colors and highlight selected edge
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const line = g.select(".edge-line");
        if (this.selected.type === "edge" && this.selected.id === d.id)
          line.style("stroke", this.palette[this.currentTheme].edge.strokeSelected);
        else line.style("stroke", this.palette[this.currentTheme].edge.stroke);
      });

      // If a node is selected, place the selectionRect around its current bounding box
      if (this.selected.type === "node" && this.selected.id) {
        const nodeGroup = this.nodesG.selectAll("g.node-group").filter(d => d.id === this.selected.id);
        if (!nodeGroup.empty()) {
          const gNode = nodeGroup.node();
          if (gNode) {
            // Get the bounding box of the node group in its local coordinate system
            const gBounding = gNode.getBBox();
            // Get the node group's transform attribute (translate(x,y))
            const transformAttr = gNode.getAttribute("transform") || "translate(0,0)";
            const translateMatch = transformAttr.match(/translate\(([^,]+),([^)]+)\)/);
            let translateX = 0, translateY = 0;
            if (translateMatch) {
              translateX = parseFloat(translateMatch[1]) || 0;
              translateY = parseFloat(translateMatch[2]) || 0;
            }

            // Adjust bounding box coordinates by the node group's translation
            const pad = 2;
            const rectX = gBounding.x + translateX - pad;
            const rectY = gBounding.y + translateY - pad;
            const rectWidth = gBounding.width + pad * 2;
            const rectHeight = gBounding.height + pad * 2;

            // Apply the selection rectangle attributes
            this.selectionRect
              .attr("x", rectX)
              .attr("y", rectY)
              .attr("width", rectWidth)
              .attr("height", rectHeight)
              .style("display", null);

          } else {
            this.selectionRect.style("display", "none");
          }
        } else {
          this.selectionRect.style("display", "none");
        }
      } else {
        // Hide selection rect if nothing selected
        this.selectionRect.style("display", "none");
      }
    }

    // Determine stroke color for selected node (prefer node scheme's strokeSelected)
    _getSelectedNodeStroke(nodeId) {
      const node = (this.map.nodes || []).find(n => n.id === nodeId);
      if (!node) return this.palette[this.currentTheme].edge.strokeSelected;
      const scheme = this.colorSchemes[node.colorSchemeName];
      if (scheme && scheme.strokeSelected) return scheme.strokeSelected;
      return this.palette[this.currentTheme].edge.strokeSelected;
    }

    // -------------------- CONNECTION WORKFLOW (frontend helpers) --------------------
    // Start connection from currently selected node (frontend should call this when user clicks 'connect' in node tools)
    startConnectionFromSelected() {
      if (!this.selected || this.selected.type !== "node") return;
      this._pendingConnectionFrom = this.selected.id;
      // Frontend should indicate to the user: "Click another node to connect"
    }

    // Cancel a pending connection
    cancelPendingConnection() {
      this._pendingConnectionFrom = null;
    }

    // -------------------- REMOVAL / UPDATES --------------------
    deleteNode(nodeId) {
      if (!nodeId) return;
      // Remove node
      this.map.nodes = (this.map.nodes || []).filter(n => n.id !== nodeId);
      // Remove connected edges
      this.map.edges = (this.map.edges || []).filter(e => e.source !== nodeId && e.target !== nodeId);
      this._saveMapToStorage();
      this.updateMap(true);
      this._setSelected(null, null);
    }

    deleteEdge(edgeId) {
      if (!edgeId) return;
      this.map.edges = (this.map.edges || []).filter(e => e.id !== edgeId);
      this._saveMapToStorage();
      this.updateMap(true);
      this._setSelected(null, null);
    }

    // Programmatic selection
    selectElement({ nodeId = null, edgeId = null } = {}) {
      if (nodeId) this._setSelected("node", nodeId);
      else if (edgeId) this._setSelected("edge", edgeId);
      else this._setSelected(null, null);
    }

    // Utility: get shallow copy of canvas map
    getMap() {
      return JSON.parse(JSON.stringify(this.map));
    }

    // -------------------- INTERNAL: resize handler --------------------
    _onResize() {
      // update grid dots and center force
      this._updateDotGrid();
      this.simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
      this.simulation.alpha(0.2).restart();
    }

    // -------------------- HELPER: zoom utilities for frontend --------------------
    // Exposes a simple zoomBy utility so frontend can call mindMap.zoom.scaleBy through transition.
    zoomBy(factor = 1.2) {
      // safe guard
      if (!this.svg || !this.zoom) return;
      // Use d3 transition on svg selection to scale by factor
      this.svg.transition().duration(200).call(this.zoom.scaleBy, factor);
    }

    // Zoom to fit all nodes in viewport
    zoomFit(padding = 50) {
      if (!this.svg || !this.zoom) return;
      const nodes = this.map?.nodes || [];
      if (nodes.length === 0) return;

      // Get dimensions from container if not passed explicitly
      const bbox = this.svg.node().getBoundingClientRect();
      const viewportWidth = width || bbox.width;
      const viewportHeight = height || bbox.height;

      // Compute bounding box of all VISIBLE nodes (hidden nodes are ignored)
      const visibleNodes = nodes.filter(n => !n.hidden);
      if (visibleNodes.length === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      visibleNodes.forEach(n => {
        const x = typeof n.x === "number" ? n.x : 0;
        const y = typeof n.y === "number" ? n.y : 0;
        const nodeWidth = n.hidden ? this.hiddenNodeWidth : this.nodeWidth;
        const nodeHeight = n.hidden ? this.hiddenNodeHeight : this.nodeHeight;
        minX = Math.min(minX, x - nodeWidth / 2);
        maxX = Math.max(maxX, x + nodeWidth / 2);
        minY = Math.min(minY, y - nodeHeight / 2);
        maxY = Math.max(maxY, y + nodeHeight / 2);
      });

      // Bounding box dimensions
      const nodesWidth = maxX - minX;
      const nodesHeight = maxY - minY;

      // Compute scale factor to fit bounding box into viewport, preserving aspect ratio
      const scaleX = (viewportWidth - padding * 2) / nodesWidth;
      const scaleY = (viewportHeight - padding * 2) / nodesHeight;
      let scale = Math.min(scaleX, scaleY);

      // Clamp zoom scale to avoid over-zooming or under-zooming
      scale = Math.max(Math.min(scale, 3), 0.2); // respects your zoom extent config

      // Compute translation to center all nodes in the viewport
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const translateX = viewportWidth / 2 - scale * centerX;
      const translateY = viewportHeight / 2 - scale * centerY;

      // Build the new D3 transform
      const transform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);

      // Animate the zoom transform (smooth transition)
      this.svg.transition()
        .duration(350)
        .call(this.zoom.transform, transform);
    }

    // Center viewport on selected node
    centerOnNode() {
      // Get selected node
      const nodeId = this.selected && this.selected.id;
      const node = (this.map.nodes || []).find(n => n.id === nodeId);
      if (!node || node.x == null || node.y == null) return;
      // Compute required transform to center that node in the viewport (preserve current scale)
      const svgEl = this.svg.node();
      const bbox = svgEl.getBoundingClientRect();
      // Get current transform
      const transform = d3.zoomTransform(this.svg.node());
      // target screen center in SVG coordinates
      const targetX = node.x;
      const targetY = node.y;
      // compute translate to center node
      const k = transform.k;
      const tx = (bbox.width / 2) - (targetX * k);
      const ty = (bbox.height / 2) - (targetY * k);
      const t = d3.zoomIdentity.translate(tx, ty).scale(k);
      this.svg.transition().duration(350).call(this.zoom.transform, t);
    }
  }

  // Expose class globally
  window.braintroop = braintroop;

  // Convenience auto-instantiation if '#canvas' exists
  try {
    if (document.querySelector("#canvas")) {
      window.braintroop = new braintroop("#canvas");
    }
  } catch (err) {
    console.error("braintroop error:", err);
  }

})();