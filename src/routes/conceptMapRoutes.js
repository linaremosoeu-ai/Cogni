import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import geminiService from '../utils/geminiService.js';
import ConceptGraphBuilder from '../utils/conceptGraphBuilder.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const conceptGraphs = new Map();
const graphBuilders = new Map();

router.get('/:documentId', protect, (req, res) => {
  const graph = conceptGraphs.get(req.params.documentId);
  if (!graph) {
    return res.status(404).json({ error: 'Concept map not found' });
  }

  res.json({
    success: true,
    graph: graph
  });
});

router.post('/:documentId/build', protect, asyncHandler(async (req, res) => {
  const concepts = req.body.concepts;
  if (!Array.isArray(concepts) || concepts.length === 0) {
    return res.status(400).json({ error: 'Concepts array is required' });
  }

  const builder = new ConceptGraphBuilder();
  const graph = builder.buildFromConceptList(concepts);

  conceptGraphs.set(req.params.documentId, graph);
  graphBuilders.set(req.params.documentId, builder);

  res.status(201).json({
    success: true,
    message: 'Concept map created',
    graph: graph
  });
}));

router.post('/:documentId/expand/:nodeId', protect, asyncHandler(async (req, res) => {
  const builder = graphBuilders.get(req.params.documentId);
  if (!builder) {
    return res.status(404).json({ error: 'Concept map not found' });
  }

  const node = builder.nodes.get(req.params.nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  const expanded = await geminiService.expandConceptNode(
    req.params.nodeId,
    node.label
  );

  const result = builder.expandNode(req.params.nodeId, expanded.subConcepts || []);

  const graph = builder.getGraphData();
  conceptGraphs.set(req.params.documentId, graph);

  res.json({
    success: true,
    message: 'Node expanded',
    expansion: result,
    graph: graph
  });
}));

router.get('/:documentId/node/:nodeId', protect, (req, res) => {
  const builder = graphBuilders.get(req.params.documentId);
  if (!builder) {
    return res.status(404).json({ error: 'Concept map not found' });
  }

  const details = builder.getNodeDetails(req.params.nodeId);
  if (!details) {
    return res.status(404).json({ error: 'Node not found' });
  }

  res.json({
    success: true,
    nodeDetails: details
  });
});

export default router;