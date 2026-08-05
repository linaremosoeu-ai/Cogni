import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import axios from 'axios';

const router = express.Router();

router.post('/test', protect, asyncHandler(async (req, res) => {
  const { method, url, headers, body, params } = req.body;

  if (!method || !url) {
    return res.status(400).json({ error: 'Method and URL are required' });
  }

  try {
    const config = {
      method: method.toUpperCase(),
      url: url,
      headers: headers || {},
      params: params
    };

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = body;
    }

    const response = await axios(config);

    res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}));

router.get('/templates', protect, (req, res) => {
  const templates = [
    {
      name: 'GET Request',
      method: 'GET',
      url: 'https://api.example.com/endpoint',
      headers: { 'Content-Type': 'application/json' },
      body: null
    },
    {
      name: 'POST Request',
      method: 'POST',
      url: 'https://api.example.com/endpoint',
      headers: { 'Content-Type': 'application/json' },
      body: { key: 'value' }
    },
    {
      name: 'GET /api/products',
      method: 'GET',
      url: 'http://localhost:5000/api/products',
      headers: { 'Content-Type': 'application/json' },
      body: null
    },
    {
      name: 'POST /api/products',
      method: 'POST',
      url: 'http://localhost:5000/api/products',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'New Product',
        price: 99.99,
        description: 'Product description'
      }
    }
  ];

  res.json({
    success: true,
    templates: templates
  });
});

export default router;