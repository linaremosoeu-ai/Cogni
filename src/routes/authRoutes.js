import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { generateToken } from '../utils/authMiddleware.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const users = new Map();

// Temporary test user for development
const testUser = {
  id: 'user_test',
  email: 'test@cogni.ai',
  password: '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUVj/46m', // password: 123456Aa
  name: 'Test User',
  createdAt: new Date()
};
users.set('test@cogni.ai', testUser);

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    validateEmail(email);
    validatePassword(password);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const userId = `user_${Date.now()}`;

  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date()
  };

  users.set(email, newUser);

  const token = generateToken(userId, email);
  res.status(201).json({
    success: true,
    token,
    user: { id: userId, email, name }
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    validateEmail(email);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id, user.email);
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
}));

router.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  const decoded = jwt.decode(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const newToken = generateToken(decoded.userId, decoded.email);
  res.json({ success: true, token: newToken });
});

export default router;