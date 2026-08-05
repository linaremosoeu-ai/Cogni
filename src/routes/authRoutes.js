import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { generateToken } from '../utils/authMiddleware.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import bcryptjs from 'bcryptjs';

const router = express.Router();
const users = new Map();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  validateEmail(email);
  validatePassword(password);

  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const userId = `user_${Date.now()}`;

  users.set(email, {
    id: userId,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date()
  });

  const token = generateToken(userId, email);
  res.status(201).json({
    success: true,
    token,
    user: { id: userId, email, name }
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateEmail(email);
  if (!password) throw new Error('Password is required');

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