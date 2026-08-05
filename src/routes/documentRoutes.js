import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import { validateFileUpload, validateDocumentInput } from '../utils/validators.js';
import documentParser from '../utils/documentParser.js';
import geminiService from '../utils/geminiService.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const documents = new Map();
const userDocuments = new Map();

router.post('/upload', protect, upload.single('file'), asyncHandler(async (req, res) => {
  validateFileUpload(
    req.file,
    process.env.ALLOWED_MIME_TYPES.split(','),
    parseInt(process.env.MAX_FILE_SIZE)
  );
  validateDocumentInput(req.body);

  const { title, description } = req.body;
  const documentId = uuidv4();

  const text = await documentParser.parseDocument(req.file.path, req.file.mimetype);
  const summary = documentParser.extractSummary(text);
  const keyPhrases = documentParser.extractKeyPhrases(text);
  const readingTime = documentParser.calculateReadingTime(text);

  const document = {
    id: documentId,
    userId: req.user.userId,
    title,
    description,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    content: text,
    summary,
    keyPhrases,
    readingTime,
    uploadedAt: new Date(),
    extractedVault: null,
    conceptMap: null
  };

  documents.set(documentId, document);
  
  if (!userDocuments.has(req.user.userId)) {
    userDocuments.set(req.user.userId, []);
  }
  userDocuments.get(req.user.userId).push(documentId);

  res.status(201).json({
    success: true,
    document: {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      fileSize: document.fileSize,
      readingTime: document.readingTime,
      uploadedAt: document.uploadedAt,
      keyPhrases: document.keyPhrases.slice(0, 10)
    }
  });
}));

router.get('/', protect, (req, res) => {
  const userDocs = userDocuments.get(req.user.userId) || [];
  const docs = userDocs.map(id => {
    const doc = documents.get(id);
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      readingTime: doc.readingTime,
      uploadedAt: doc.uploadedAt
    };
  });
  res.json({ success: true, documents: docs });
});

router.get('/:id', protect, (req, res) => {
  const document = documents.get(req.params.id);
  if (!document || document.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    success: true,
    document: {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      fileSize: document.fileSize,
      readingTime: document.readingTime,
      summary: document.summary,
      keyPhrases: document.keyPhrases.slice(0, 20),
      uploadedAt: document.uploadedAt
    }
  });
});

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const document = documents.get(req.params.id);
  if (!document || document.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Document not found' });
  }

  await fs.unlink(document.filePath).catch(() => {});
  documents.delete(req.params.id);
  const userDocs = userDocuments.get(req.user.userId);
  if (userDocs) {
    userDocuments.set(req.user.userId, userDocs.filter(id => id !== req.params.id));
  }

  res.json({ success: true, message: 'Document deleted' });
}));

export default router;