// BrainTroop Interactive Mind Map Canvas using D3.js v7
// Local storage key: 'braintroop-map'

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
      // Backend schema: { projectId, owner, colabs[{email, userId}], userPrompt, title, lastUpdated, nodes [{nodeId, shortName, content, detail, directLink, relatedLink, xy, hidden, colorScheme, layer }] }
      this.mapKey = "braintroop-map";

      // Grid and sizing defaults
      this.gridSpacing = 50;               // modular grid spacing
      this.nodeWidth = 146;                // default node width (grid modular)
      this.nodeHeight = 46;                // default node height
      this.nodeBorderRadius = 10;          // default node border radius
      this.hiddenNodeWidth = 30;           // when hidden, smaller shape
      this.hiddenNodeHeight = 30;
      this.hiddenNodeBorderRadius = 5;
      this.nodeSnapOffset = { x: this.nodeWidth / 2, y: this.nodeHeight / 2 };
      this.nodeMargin = 2;                 // small margin requested

      // Palette structure
      this.palette = {
        dark: {
          canvas: { bg: "none", gridDot: "#3a4d6a" },
          node: { fill: "#1f2f45", stroke: "#3a4d6a", text: "#e0e0e0", selected: "#54c3eb" },
          edge: { stroke: "#3a4d6a", strokeSelected: "#54c3eb", style: "solid" } },
        light: {
          canvas: { bg: "none", gridDot: "#d5dce5" },
          node: { fill: "#f3f6fa", stroke: "#d5dce5", text: "#1a1a1a", selected: "#00a3d4" },
          edge: { stroke: "#d5dce5", strokeSelected: "#00a3d4", style: "solid" } } };
      // Preset color schemes for nodes
      this.colorSchemes = {
        "ocean": { "fill": "#1f2f45", "stroke": "#3a4d6a", "strokeSelected": "#54c3eb", "text": "#e0e0e0" },
        "pearl": { "fill": "#f3f6fa", "stroke": "#d5dce5", "strokeSelected": "#ffffff", "text": "#1a1a1a" },
      }

      // Theme state (dark or light)
      this.currentTheme = "dark";
      this.currentColorScheme = "ocean";

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
      this.linkForce = null;
      this.chargeForce = null;
      this.collideForce = null;
      this.forcesActive = false; // enable forces only during drag

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
    // Initializes D3 SVG, groups, zoom behavior, and force simulation.
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
        .style("background", "none")
        .style("cursor", "grab");

      // Root group for pan/zoom transforms
      this.g = this.svg.append("g").attr("class", "root-g");

      // Grid group for dotted grid
      this.gridG = this.g.append("g").attr("class", "dot-grid");
      this._updateDotGrid();

      // Edge arrow marker (optional; guard for setTheme usage)
      const defs = this.svg.append("defs");
      defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 10)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", this.palette[this.currentTheme].edge.stroke);

      // Groups for edges and nodes
      this.edgesG = this.g.append("g").attr("class", "edges");
      this.nodesG = this.g.append("g").attr("class", "nodes");

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
        .force("link", d3.forceLink().id(d => d.id).distance(160).strength(0))
        .force("charge", d3.forceManyBody().strength(0))
        // NOTE: changed collision radius function to always return a radius so locked nodes
        // can repel/magnetize unlocked nodes while remaining pinned (via fx/fy).
        .force("collide", d3.forceCollide(d => {
          const mapNode = d.__mapNode || {};
          const r = (mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth) * 0.6;
          return r;
        }).strength(0))
        .force("magnetic", this._magneticForce.bind(this)); // custom magnetic snapping / repulsion

      // Keep references to adjust strengths on drag
      this.linkForce = this.simulation.force("link");
      this.chargeForce = this.simulation.force("charge");
      this.collideForce = this.simulation.force("collide");

      // Ensure tick enforces locked nodes immutability (E1)
      this.simulation.on("tick.enforceLocked", () => {
        const simNodes = this.simulation.nodes() || [];
        for (const n of simNodes) {
          const mapNode = n && n.__mapNode;
          if (mapNode && mapNode.locked === true) {
            // enforce position exactly to fx/fy if present, otherwise to stored x,y
            if (typeof n.fx === "number" && typeof n.fy === "number") {
              n.x = n.fx;
              n.y = n.fy;
            } else if (typeof mapNode.x === "number" && typeof mapNode.y === "number") {
              n.x = mapNode.x;
              n.y = mapNode.y;
              n.fx = mapNode.x;
              n.fy = mapNode.y;
            }
            // zero velocities to avoid drift
            n.vx = 0; n.vy = 0;
          }
        }
      });
    }

    // Enables drag forces and pins locked nodes during drag operations.
    _enableDragForces(draggingNodeId = null) {
      this.forcesActive = true;
      if (this.linkForce && this.linkForce.strength) this.linkForce.strength(0.1);
      if (this.chargeForce && this.chargeForce.strength) this.chargeForce.strength(-200);
      if (this.collideForce && this.collideForce.strength) this.collideForce.strength(1);

      // Pin locked nodes explicitly here as well (reassert fx/fy and zero velocity)
      const simNodes = this.simulation.nodes() || [];
      simNodes.forEach(n => {
        try {
          if (n && n.__mapNode && n.__mapNode.locked === true) {
            const mapNode = n.__mapNode;
            // If this locked node is the one currently being dragged, don't override its fx/fy
            if (draggingNodeId && n.id === draggingNodeId) {
              // ensure it has fx/fy defined so tick.enforceLocked behaves predictably
              if (typeof n.fx !== "number" || typeof n.fy !== "number") {
                const px = (typeof mapNode.x === "number") ? mapNode.x : n.x;
                const py = (typeof mapNode.y === "number") ? mapNode.y : n.y;
                n.fx = px;
                n.fy = py;
                n.x = px; n.y = py;
                n.vx = 0; n.vy = 0;
              }
            } else {
              // Normal pin behavior for other locked nodes
              const px = (typeof mapNode.x === "number") ? mapNode.x : n.x;
              const py = (typeof mapNode.y === "number") ? mapNode.y : n.y;
              n.fx = px;
              n.fy = py;
              n.x = px; n.y = py;
              n.vx = 0; n.vy = 0;
            }
          }
        } catch (e) {
          // ignore per-node errors
        }
      });
      this.simulation.alphaTarget(0.3).restart();
    }

    // Disables drag forces when not dragging, keeping locked nodes pinned.
    _disableDragForces() {
      this.forcesActive = false;
      if (this.linkForce && this.linkForce.strength) this.linkForce.strength(0);
      if (this.chargeForce && this.chargeForce.strength) this.chargeForce.strength(0);
      if (this.collideForce && this.collideForce.strength) this.collideForce.strength(0);
      // Keep locked nodes pinned (do not clear fx/fy) to ensure immutability across updates
      this.simulation.alphaTarget(0);
    }

    // -------------------- PRIVATE: GRID --------------------
    // Draws a dotted grid beyond the visible area for visual reference.
    _updateDotGrid() {
      // Compute approximate visible area
      const bbox = this.canvas.getBoundingClientRect();
      const width = Math.max(bbox.width, 2 * window.innerWidth);
      const height = Math.max(bbox.height, 2 *window.innerHeight);

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
    // Custom magnetic force: attracts unlocked nodes to nearest grid intersection
    // and repels them from locked nodes when too close.
    _magneticForce(alpha) {
      // alpha: small positive number from simulation tick
      if (!this.map.nodes || !this.forcesActive) return;
      const simNodes = this.simulation.nodes() || [];
      if (!simNodes || simNodes.length === 0) return;

      // Build quick lookup of locked nodes positions
      const lockedNodes = [];
      for (const n of simNodes) {
        if (!n || !n.__mapNode) continue;
        if (n.__mapNode.locked === true) {
          // locked position - prefer fx/fy if present
          const lx = (typeof n.fx === "number") ? n.fx : n.x;
          const ly = (typeof n.fy === "number") ? n.fy : n.y;
          lockedNodes.push({ x: lx, y: ly });
        }
      }

      // For each sim node that is unlocked, apply:
      //  - gentle attraction towards nearest grid point
      //  - repulsive force away from any locked node closer than a threshold
      const gridSpacing = this.gridSpacing;
      const repelRadius = Math.max(this.nodeWidth, this.nodeHeight) * 1.2; // radius within which repulsion occurs
      const repelStrength = 0.6;  // scale of repulsion
      const gridPull = 0.05;     // attraction to grid
      for (const n of simNodes) {
        if (!n || !n.__mapNode) continue;
        const mapNode = n.__mapNode;
        // Skip locked nodes entirely
        if (mapNode.locked === true) continue;

        // --- Grid pull ---
        // compute nearest grid intersection
        const gx = Math.round(n.x / gridSpacing) * gridSpacing;
        const gy = Math.round(n.y / gridSpacing) * gridSpacing;
        // apply gentle acceleration toward grid center scaled by alpha
        const dxg = gx - n.x;
        const dyg = gy - n.y;
        n.vx += dxg * gridPull * alpha;
        n.vy += dyg * gridPull * alpha;

        // --- Repel from locked nodes if too close ---
        if (lockedNodes.length > 0) {
          for (const ln of lockedNodes) {
            const dx = n.x - ln.x;
            const dy = n.y - ln.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 === 0) {
              // jitter slightly to break exact overlap
              n.vx += (Math.random() - 0.5) * 0.1;
              n.vy += (Math.random() - 0.5) * 0.1;
              continue;
            }
            const dist = Math.sqrt(dist2);
            if (dist < repelRadius) {
              // normalized vector away from locked node
              const nx = dx / dist;
              const ny = dy / dist;
              // magnitude grows as nodes get closer
              const strength = (1 - dist / repelRadius) * repelStrength * alpha;
              n.vx += nx * strength;
              n.vy += ny * strength;
            }
          }
        }
      }
    }

    // -------------------- PRIVATE: STORAGE --------------------
    // Loads the map from localStorage into the in-memory canvas model.
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

    // Saves the in-memory canvas map to localStorage in backend format.
    _saveMapToStorage() {
      try {
        // Convert canvas map to backend schema and persist
        const backendMap = this._convertMapToBackend();
        localStorage.setItem(this.mapKey, JSON.stringify(backendMap));
      } catch (err) {
        console.error("braintroop: failed to save map to storage", err);
      }
    }

    // Converts backend map schema to canvas map schema.
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

    // Converts canvas map schema to backend map schema.
    _convertMapToBackend() {
      // Build lookup for edges
      const directLinks = {};
      const relatedLinks = {};
      // Loop all edges
      (this.map.edges || []).forEach(e => {
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
        // Always store xy as "x,y" string or null if unlocked
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
    // Replaces the entire map and renders it.
    setMap(map) {
      // Check map
      if (!map) return;
        this.map = this._convertMapToCanvas(map);
      // Update full map on canvas
      this.updateMap(true);
    }

    // Deletes the entire map.
    deleteMap() {
      // Delete canvas map
      this.map = { nodes: [], edges: [] };
      // Update canvas
      this.updateMap(true);
      // reset selection
      this._setSelected(null, null);
    }

    // Reads the local storage backend map, converts to canvas map and rebuilds.
    // Parameter `forceFull` instructs to fully rebuild bindings if needed.
    updateMap(forceFull = false) {
      // Load canvas map from local storage backend map
      this._loadMapFromStorage();
      // Quick bail if nothing changed? Here we always diff-bind (optimized enough).
      this._bindEdgesAndNodes(forceFull);
      // Persist map changes after any conversions
      this._saveMapToStorage();
    }

    // Adds a new node connected to the specified parent.
    // Accepts object: { id: string, content: string, layer: int, colorSchemeName: string, nodeXY: "x,y" (optional), locked: boolean }
    addNode({ parentId, id, shortName = "", content = "", detail = "", nodeXY = null, locked = false, layer = 0, colorSchemeName = this.currentColorScheme } = {}) {
      // Check parentId
      if (!parentId) return;

      // If missing id, generate one
      if (!id) id = `temp_${Date.now()}_${Math.floor(Math.random() * 99)}`;

      // Determine initial coords: first node center, others random
      let x = null, y = null;
      if (nodeXY && typeof nodeXY === "string" && nodeXY.includes(",")) {
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

      // Set color scheme
      if (!colorSchemeName) colorSchemeName = this.currentColorScheme; // default color scheme
      // Inherit parent color scheme
      const parentNode = this.map.nodes.find(n => n.id === parentId);
      if (parentNode && parentNode.colorSchemeName) colorSchemeName = parentNode.colorSchemeName;

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
        hidden: false
      };
      // Push node
      this.map.nodes.push(this._normalizeNode(node));
      
      // Set edge
      this.setConnection(parentId, id, "direct");
      
      // Select this node
      this._setSelected(id, null);

      this.updateMap();
      // Return node id (temporary id)
      return node.id;
    }

    // Connects two nodes with an edge of specified type ('direct' or 'related').
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

    // Disconnects two nodes by removing edges in both directions.
    disconnect(nodeFromId, nodeToId) {
      if (!nodeFromId || !nodeToId) return;
      const ids = new Set([`edge-${nodeFromId}-${nodeToId}`, `edge-${nodeToId}-${nodeFromId}`]);
      const before = this.map.edges.length;
      this.map.edges = (this.map.edges || []).filter(e => !ids.has(e.id));
      if (this.map.edges.length !== before) {
        this._saveMapToStorage();
        this.updateMap();
      }
    }

    // Removes a specific edge by its ID.
    removeEdge(edgeId) {
      if (!edgeId) return;
      const before = this.map.edges.length;
      this.map.edges = (this.map.edges || []).filter(e => e.id !== edgeId);
      if (this.map.edges.length !== before) {
        this._saveMapToStorage();
        this.updateMap();
      }
    }

    // Toggles between dark and light themes.
    setTheme(themeName) {
      if (!this.palette[themeName]) return;
      this.currentTheme = themeName;
      // Update grid dot colors
      this._updateDotGrid();
      // Update arrow marker color (guard if path exists)
      const markerPath = this.svg.select("defs marker#arrow path");
      if (!markerPath.empty()) {
        markerPath.attr("fill", this.palette[this.currentTheme].edge.stroke);
      }
      // Repaint nodes/edges
      this.updateMap(true);
    }

    // Sets the color scheme for a specific node.
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

    // Toggles visibility of nodes at or above the specified layer.
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

    // Exports the canvas as PNG or SVG.
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
    // Emits 'select' event with { nodeId, edgeId } where one is non-null.
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
      this.canvas.dispatchEvent(new CustomEvent("select", { detail: { nodeId, edgeId } }));
      // Feature: immediately update visual selection rectangle / edge highlight
      this._paintSelection();
    }

    // Emits 'nodeMove' after a node has been dragged & dropped and persisted.
    _emitNodeMove(nodeId, nodeXY) {
      this.canvas.dispatchEvent(new CustomEvent("nodeMove", { detail: { nodeId, nodeXY } }));
    }

    // Convenience to set selection programmatically.
    _setSelected(type, id) {
      if (type === "node") this._emitSelect(id, null, null);
      else if (type === "edge") this._emitSelect(null, id);
      else this._emitSelect(null, null, null);
    }

    // -------------------- PRIVATE: BINDING NODES & EDGES --------------------
    // Transforms this.map into D3 nodes/links and binds enter/update/exit.
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

        const sn = {
          id: n.id,
          x: x !== null ? x : (window.innerWidth / 2 + (Math.random() - 0.5) * 200),
          y: y !== null ? y : (window.innerHeight / 2 + (Math.random() - 0.5) * 200),
          __mapNode: n
        };

        // Feature: if node is locked, pin it using fx/fy so forces won't move it
        if (n.locked === true) {
          // ensure fx/fy always set (even if x/y were null originally)
          sn.fx = (typeof n.x === "number" ? n.x : sn.x);
          sn.fy = (typeof n.y === "number" ? n.y : sn.y);
          // preserve exact x/y as well
          sn.x = sn.fx; sn.y = sn.fy;
        }

        return sn;
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
        .style("cursor", "pointer")
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
            const mapNode = d.__mapNode;
            // Store initial position
            d.startX = d.x;
            d.startY = d.y;
            // Pin to current position so drag has a stable starting point
            d.fx = d.x;
            d.fy = d.y;
            // Enable forces and pin other locked nodes.
            // If we're dragging a locked node, pass its id so we don't override its fx/fy.
            this._enableDragForces(mapNode && mapNode.locked === true ? d.id : null);

            // cursor feedback
            try { this.svg.style("cursor", "grabbing"); } catch (e) {}
          })
          .on("drag", (event, d) => {
            // Always allow movement while dragging (locked or unlocked)
            const [nx, ny] = d3.pointer(event, this.g.node());
            d.fx = nx;
            d.fy = ny;
            d.x = nx;
            d.y = ny;
            // Immediate visual update while dragging
            if (event.subject && event.subject.__containerNode) {
              d3.select(event.subject.__containerNode).attr("transform", `translate(${d.x - this.nodeWidth / 2}, ${d.y - this.nodeHeight / 2})`);
            }
            this._tickUpdatePositions();
          })
          .on("end", (event, d) => {
            const mapNode = d.__mapNode;
            // Snap to grid on drop (world coords)
            const margin = this.nodeMargin || 0;
            const grid = this.gridSpacing;

            let snappedX = Math.round(d.x / grid) * grid;
            let snappedY = Math.round(d.y / grid) * grid;
            if (Math.abs(snappedX - d.x) <= margin) snappedX = d.x;
            if (Math.abs(snappedY - d.y) <= margin) snappedY = d.y;
            // Assign final coordinates and pin (lock) the node
            d.x = snappedX; d.y = snappedY;
            d.fx = snappedX; d.fy = snappedY;
            d.vx = 0; d.vy = 0;

            // Consider only relevant movements
            if (mapNode) {
              const minMove = Math.ceil(this.gridSpacing / 2);
              const moved = Math.abs(snappedX - d.startX) > minMove || Math.abs(snappedY - d.startY) > minMove;
              if (moved) {
                // Persist new nodeXY and mark node as locked (always lock on drop)
                mapNode.nodeXY = `${Math.round(d.x)},${Math.round(d.y)}`;
                mapNode.x = d.x; mapNode.y = d.y;
                mapNode.locked = true;
                // Persist and emit move event
                this._saveMapToStorage();
                if (mapNode) this._emitNodeMove(mapNode.id, mapNode.nodeXY);
                // Select node after drop so selection UI updates immediately
                if (mapNode) this._setSelected("node", mapNode.id);
              }
            }

            // Let forces tick briefly to settle unlocked nodes, then disable aggressive forces
            this.simulation.alpha(0.2).restart();
            this._disableDragForces();

            // Ensure storage is up-to-date
            this._saveMapToStorage();

            // restore cursor
            try { this.svg.style("cursor", "grab"); } catch (e) {}
          })
        )

      // Attach container node reference (used in drag) for newly entered nodes
      nodeEnter.each((d, i, nodes) => {
        d.__containerNode = nodes[i];
      });

      // Append selected node rect (hidden as initial state)
      nodeEnter.append("rect")
        .attr("class", "selection-rect")
        .attr("rx", d => d.__mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius)
        .attr("ry", d => d.__mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius)
        .style("fill", "none")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .style("pointer-events", "none")
        .style("display", "none");

      // Append rect and text inside node group
      nodeEnter.append("rect")
        .attr("class", "selected-node")
        .attr("rx", this.nodeBorderRadius)
        .attr("ry", this.nodeBorderRadius)
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

      // Ensure every simulation node has a container DOM reference (enter + update)
      allNodeGroups.each((d, i, nodes) => {
        d.__containerNode = nodes[i];
      });

      allNodeGroups.each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;

        // Determine dimension based on hidden state
        const w = mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth;
        const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;

        // Determine border radius based on hidden state
        const borderRadius = mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius;

        // Compute color scheme or use theme defaults
        const scheme = this.colorSchemes[mapNode.colorSchemeName] || null;
        const fill = scheme ? scheme.fill : this.palette[this.currentTheme].node.fill;
        const stroke = scheme ? scheme.stroke : this.palette[this.currentTheme].node.stroke;
        const strokeSelected = scheme ? scheme.strokeSelected : this.palette[this.currentTheme].node.selected;
        const textColor = scheme ? scheme.text : this.palette[this.currentTheme].node.text;

        // Update rect size & corner radius (hidden nodes become circular-ish)
        g.select(".selected-node")
          .attr("width", w)
          .attr("height", h)
          .attr("rx", borderRadius)
          .attr("ry", borderRadius)
          .style("fill", fill)
          .style("stroke", (this.selected.type === "node" && this.selected.id === mapNode.id) ? strokeSelected : stroke);

        // Compute padded dimensions for selection rect
        const pad = 3;
        const selWidth = w + pad * 2;
        const selHeight = h + pad * 2;

        // Update selection rect (position at -pad to outset)
        g.select(".selection-rect")
          .attr("x", -pad)
          .attr("y", -pad)
          .attr("width", selWidth)
          .attr("height", selHeight)
          .attr("rx", borderRadius)
          .attr("ry", borderRadius)
          .style("fill", this.palette[this.currentTheme].node.selected)
          .style("display", (this.selected.type === "node" && this.selected.id === mapNode.id) ? null : "none");

        // Update text: show '+' sign if hidden, otherwise content; adjust font size
        const nodeText = mapNode.hidden ? "+" : (mapNode.shortName || "");
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
      this.simulation.on("tick.updateDOM", () => {
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

    // Helper: updates positions instantly (used during drag).
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
    // Normalizes node object shape and sets defaults. Ensures numeric x,y if possible.
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

      // Feature: translate any 'locked'
      // FIXED: use straightforward boolean coercion for locked default (was previously confusing)
      const isLocked = !!n.locked;

      return {
        id: String(n.id),
        shortName: n.shortName || "",
        // store canonical nodeXY as string if possible
        nodeXY: (typeof nodeXY === "string" ? nodeXY : (x !== null && y !== null ? `${Math.round(x)},${Math.round(y)}` : "")),
        // numeric coordinates (might be null)
        x: (typeof x === "number" ? x : null),
        y: (typeof y === "number" ? y : null),
        // Feature: lock nodes position x y
        locked: !!n.locked,
        layer: typeof n.layer === "number" ? n.layer : 0,
        colorSchemeName: n.colorSchemeName || n.colorScheme || "ocean",
        hidden: !!n.hidden,
        parentId: n.parentId || n.parent || null
      };
    }

    // Normalizes edge object.
    _normalizeEdge(e) {
      return {
        id: e.id || `edge-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: e.type === "related" ? "related" : "direct"
      };
    }

    // -------------------- PRIVATE: VISUAL SELECTION RENDERING --------------------
    // Paints selection visuals (rect around node or highlight selected edge).
    _paintSelection() {
      // Edges: Set stroke colors and highlight selected edge
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const line = g.select(".edge-line");
        if (this.selected.type === "edge" && this.selected.id === d.id)
          line.style("stroke", this.palette[this.currentTheme].edge.strokeSelected);
        else line.style("stroke", this.palette[this.currentTheme].edge.stroke);
      });

      // Feature: show selection rect & change stroke immediately
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;
        const scheme = this.colorSchemes[mapNode.colorSchemeName] || null;
        const stroke = scheme ? scheme.stroke : this.palette[this.currentTheme].node.stroke;
        const strokeSelected = scheme ? scheme.strokeSelected : this.palette[this.currentTheme].node.selected;

        const isSelected = (this.selected.type === "node" && this.selected.id === mapNode.id);

        g.select(".selected-node")
          .style("stroke", isSelected ? strokeSelected : stroke);

        g.select(".selection-rect")
          .style("display", isSelected ? null : "none");
      });
    }

    // Updates node strokes and selection rectangles immediately.
    _updateNodeStrokes() {
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;
        const scheme = this.colorSchemes[mapNode.colorSchemeName] || this.colorSchemes[this.currentColorScheme];
        const stroke = (scheme && scheme.stroke) || this.palette[this.currentTheme].node.stroke;
        const strokeSelected = this._getSelectedNodeStroke(mapNode.id);
        const isSelected = (this.selected.type === "node" && this.selected.id === mapNode.id);
        g.select(".selected-node")
          .style("stroke", isSelected ? strokeSelected : stroke);
        g.select(".selection-rect")
          .style("display", isSelected ? null : "none");
      });
    }
    
    // Determines stroke color for selected node (prefer node scheme's strokeSelected).
    _getSelectedNodeStroke(nodeId) {
      const node = (this.map.nodes || []).find(n => n.id === nodeId);
      if (!node) return this.palette[this.currentTheme].edge.strokeSelected;
      const scheme = this.colorSchemes[node.colorSchemeName];
      if (scheme && scheme.strokeSelected) return scheme.strokeSelected;
      return this.palette[this.currentTheme].edge.strokeSelected;
    }

    // -------------------- CONNECTION WORKFLOW (frontend helpers) --------------------
    // Starts a connection from the currently selected node.
    startConnectionFromSelected() {
      if (!this.selected || this.selected.type !== "node") return;
      this._pendingConnectionFrom = this.selected.id;
      // Frontend should indicate to the user: "Click another node to connect"
    }

    // Cancels a pending connection.
    cancelPendingConnection() {
      this._pendingConnectionFrom = null;
    }

    // -------------------- REMOVAL / UPDATES --------------------
    // Deletes a node and its connected edges.
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

    // Deletes an edge by ID.
    deleteEdge(edgeId) {
      if (!edgeId) return;
      this.map.edges = (this.map.edges || []).filter(e => e.id !== edgeId);
      this._saveMapToStorage();
      this.updateMap(true);
      this._setSelected(null, null);
    }

    // Programmatically selects a node or edge.
    selectElement({ nodeId = null, edgeId = null } = {}) {
      if (nodeId) this._setSelected("node", nodeId);
      else if (edgeId) this._setSelected("edge", edgeId);
      else this._setSelected(null, null);
    }

    // Utility: gets a shallow copy of the canvas map.
    getMap() {
      return JSON.parse(JSON.stringify(this.map));
    }

    // -------------------- INTERNAL: resize handler --------------------
    // Handles window resize by updating grid and simulation.
    _onResize() {
      // update grid dots and center force
      this._updateDotGrid();
      this.simulation.alpha(0.2).restart();
    }

    // -------------------- HELPER: zoom utilities for frontend --------------------
    // Zooms the canvas by a factor.
    zoomBy(factor = 1.2) {
      // safe guard
      if (!this.svg || !this.zoom) return;
      // Use d3 transition on svg selection to scale by factor
      this.svg.transition().duration(200).call(this.zoom.scaleBy, factor);
    }

    // Zooms to fit all nodes in the viewport with padding.
    zoomFit(padding = 50) {
      if (!this.svg || !this.zoom) return;
      // Use the live simulation nodes; they always have current positions
      const simNodes = (this.simulation && typeof this.simulation.nodes === "function")
        ? this.simulation.nodes()
        : [];
      if (!simNodes || simNodes.length === 0) return;
      // SVG viewport geometry
      const svgRect = this.svg.node().getBoundingClientRect();
      // Sidebar handling (assume #sidebar may exist and may be "collapsed")
      let sidebarWidth = 0;
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !(sidebar.classList && sidebar.classList.contains("collapsed"))) {
        sidebarWidth = sidebar.offsetWidth || 0;
      }
      // Visible area (screen units)
      const visibleWidth  = Math.max(1, svgRect.width  - sidebarWidth);
      const visibleHeight = Math.max(1, svgRect.height);
      // Apply padding as a margin in SCREEN space by shrinking the viewport
      const pad = Math.max(0, padding);
      const innerW = Math.max(1, visibleWidth  - 2 * pad);
      const innerH = Math.max(1, visibleHeight - 2 * pad);
      // Compute WORLD bounds of all node rectangles, using current node sizes
      let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity;
      for (const n of simNodes) {
        const mapNode = n.__mapNode || {};
        const w = mapNode.hidden ? this.hiddenNodeWidth  : this.nodeWidth;
        const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;
        // n.x/n.y are world coordinates of the node center
        const x = (typeof n.x === "number") ? n.x : 0;
        const y = (typeof n.y === "number") ? n.y : 0;
        const left   = x - w / 2;
        const right  = x + w / 2;
        const top    = y - h / 2;
        const bottom = y + h / 2;
        if (left   < minX) minX = left;
        if (right  > maxX) maxX = right;
        if (top    < minY) minY = top;
        if (bottom > maxY) maxY = bottom;
      }

      // WORLD content size and center
      let contentW = maxX - minX;
      let contentH = maxY - minY;
      // Fallbacks in degenerate cases
      if (!(contentW > 0)) contentW = 1;
      if (!(contentH > 0)) contentH = 1;

      const cx = (minX + maxX) / 2; // world center X
      const cy = (minY + maxY) / 2; // world center Y

      // Choose scale to fit content into inner viewport (preserving aspect)
      const scaleX = innerW / contentW;
      const scaleY = innerH / contentH;
      let k = Math.min(scaleX, scaleY);

      // Clamp to the zoom's configured extent
      const extent = (typeof this.zoom.scaleExtent === "function") ? this.zoom.scaleExtent() : [0.2, 5];
      const kMin = Array.isArray(extent) ? extent[0] : 0.2;
      const kMax = Array.isArray(extent) ? extent[1] : 5;
      k = Math.max(kMin, Math.min(k, kMax));

      // SCREEN target center — the center of the VISIBLE area (to the right of the sidebar)
      const px = sidebarWidth + visibleWidth / 2; // NOTE: full sidebar offset, not /2
      const py = visibleHeight / 2;

      // Translation in SCREEN units to bring (cx,cy) to (px,py)
      const tx = px - k * cx;
      const ty = py - k * cy;

      // Compose transform and animate
      const transform = d3.zoomIdentity.translate(tx, ty).scale(k);

      this.svg.transition()
        .duration(250)
        .call(this.zoom.transform, transform);
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