import { v4 as uuidv4 } from 'uuid';

class ConceptGraphBuilder {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  createNode(concept, description = '', category = 'general') {
    const nodeId = uuidv4();
    const node = {
      id: nodeId,
      label: concept,
      description,
      category,
      depth: 0,
      children: [],
      parents: [],
      metadata: {
        createdAt: new Date(),
        importance: 0.5,
        isExpanded: false
      }
    };
    this.nodes.set(nodeId, node);
    return nodeId;
  }

  createEdge(sourceId, targetId, relationship = 'related', strength = 0.5) {
    const edgeId = `${sourceId}-${targetId}-${relationship}`;
    const edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      relationship,
      strength,
      metadata: {
        createdAt: new Date(),
        isDirectional: true
      }
    };
    this.edges.set(edgeId, edge);

    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);
    
    if (source && target) {
      if (!source.children.includes(targetId)) {
        source.children.push(targetId);
      }
      if (!target.parents.includes(sourceId)) {
        target.parents.push(sourceId);
      }
      target.depth = Math.max(target.depth, source.depth + 1);
    }

    return edgeId;
  }

  buildFromConceptList(concepts) {
    const nodeIds = new Map();

    concepts.forEach(concept => {
      const id = this.createNode(
        concept.name,
        concept.definition || '',
        concept.category || 'general'
      );
      nodeIds.set(concept.name, id);
    });

    concepts.forEach(concept => {
      if (concept.relatedTopics && concept.relatedTopics.length > 0) {
        concept.relatedTopics.forEach(related => {
          const targetId = nodeIds.get(related);
          const sourceId = nodeIds.get(concept.name);
          if (sourceId && targetId) {
            this.createEdge(sourceId, targetId, 'related', 0.7);
          }
        });
      }
    });

    return this.getGraphData();
  }

  expandNode(nodeId, subConcepts) {
    const parentNode = this.nodes.get(nodeId);
    if (!parentNode) return null;

    const newNodeIds = [];
    
    subConcepts.forEach(subConcept => {
      const childId = this.createNode(
        subConcept.name,
        subConcept.description || '',
        subConcept.type || 'subtopic'
      );
      newNodeIds.push(childId);
      this.createEdge(nodeId, childId, 'contains', 0.9);
    });

    parentNode.metadata.isExpanded = true;
    return {
      parentId: nodeId,
      childrenIds: newNodeIds,
      graph: this.getGraphData()
    };
  }

  getNodeDetails(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    const children = node.children.map(id => this.nodes.get(id));
    const parents = node.parents.map(id => this.nodes.get(id));
    const relatedEdges = Array.from(this.edges.values())
      .filter(edge => edge.source === nodeId || edge.target === nodeId);

    return {
      node,
      children,
      parents,
      relatedEdges,
      pathsToRoot: this.getPathsToRoot(nodeId),
      pathsToLeaves: this.getPathsToLeaves(nodeId)
    };
  }

  getPathsToRoot(nodeId, path = [], visited = new Set()) {
    if (visited.has(nodeId)) return [path];
    visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node || node.parents.length === 0) {
      return [path];
    }

    const paths = [];
    node.parents.forEach(parentId => {
      const parentPaths = this.getPathsToRoot(
        parentId,
        [node.label, ...path],
        new Set(visited)
      );
      paths.push(...parentPaths);
    });

    return paths;
  }

  getPathsToLeaves(nodeId, path = [], visited = new Set()) {
    if (visited.has(nodeId)) return [path];
    visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node || node.children.length === 0) {
      return [path];
    }

    const paths = [];
    node.children.forEach(childId => {
      const childPaths = this.getPathsToLeaves(
        childId,
        [...path, node.label],
        new Set(visited)
      );
      paths.push(...childPaths);
    });

    return paths;
  }

  getGraphData() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      stats: {
        totalNodes: this.nodes.size,
        totalEdges: this.edges.size,
        maxDepth: Math.max(...Array.from(this.nodes.values()).map(n => n.depth), 0)
      }
    };
  }

  calculateNodeCentrality(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return 0;

    const degreeSum = node.children.length + node.parents.length;
    return degreeSum / (this.nodes.size - 1);
  }

  findShortestPath(startId, endId) {
    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const currentId = path[path.length - 1];

      if (currentId === endId) {
        return path.map(id => this.nodes.get(id).label);
      }

      const node = this.nodes.get(currentId);
      [...node.children, ...node.parents].forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      });
    }

    return null;
  }

  getClusters() {
    const clusters = [];
    const visited = new Set();

    this.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        const cluster = this.dfsCluster(nodeId, visited);
        clusters.push(cluster);
      }
    });

    return clusters;
  }

  dfsCluster(nodeId, visited) {
    const cluster = [];
    const stack = [nodeId];

    while (stack.length > 0) {
      const id = stack.pop();
      if (visited.has(id)) continue;

      visited.add(id);
      cluster.push(this.nodes.get(id));

      const node = this.nodes.get(id);
      [...node.children, ...node.parents].forEach(neighborId => {
        if (!visited.has(neighborId)) {
          stack.push(neighborId);
        }
      });
    }

    return cluster;
  }
}

export default ConceptGraphBuilder;