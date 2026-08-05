# Cogni - AI-Powered Interactive Study Engine

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API Key (get one at https://ai.google.dev)

### Installation Steps

**Option 1: From Fresh Clone**
```bash
# Clone the repository
git clone https://github.com/linaremosoeu-ai/Cogni.git
cd Cogni

# Install all dependencies (backend + frontend)
npm run install:all

# Copy environment template and add your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2, in frontend/ directory)
cd frontend
npm run dev
```

**Option 2: Manual Setup**
```bash
# Backend
npm install
cp .env.example .env
# Edit .env with your API key
npm run dev  # Runs on http://localhost:5000

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Gemini AI
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_FALLBACK_MODEL=gemini-1.5-flash-8b

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,text/plain,text/markdown,image/jpeg,image/png,image/webp

# Storage
STORAGE_PATH=./uploads
STUDY_VAULT_PATH=./study-vaults

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Troubleshooting

**npm install fails with package not found**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

**Cannot find module errors**
- Make sure you ran `npm install` in both root and frontend directories
- Check that all dependencies in package.json have valid versions

**Port already in use**
- Change PORT in .env (default: 5000)
- Frontend uses 5173 by default, change in `frontend/vite.config.js` if needed

**Gemini API errors**
- Verify your API key is correct in .env
- Check API quotas at https://console.cloud.google.com
- Ensure your IP isn't rate-limited

### Running the Application

Once both servers are running:

1. Open http://localhost:5173 in your browser
2. Sign up or log in with test credentials
3. Upload a document (PDF, DOCX, etc.)
4. Extract study materials with AI
5. Create flashcards, take quizzes, and use the AI tutor

### API Documentation

Base URL: `http://localhost:5000/api`

**Authentication**
- `POST /auth/register` - Create account
- `POST /auth/login` - Sign in
- `POST /auth/refresh` - Refresh JWT token

**Documents**
- `POST /documents/upload` - Upload study material
- `GET /documents` - List your documents
- `GET /documents/:id` - Get document details
- `DELETE /documents/:id` - Delete document

**Study Vault**
- `POST /study-vault/:documentId/extract` - Extract concepts and definitions
- `GET /study-vault/:documentId` - Get extracted vault
- `PUT /study-vault/:documentId/terms` - Update term mastery level

**Concept Map**
- `POST /concept-map/:documentId/build` - Build knowledge graph
- `GET /concept-map/:documentId` - Get concept map
- `POST /concept-map/:documentId/expand/:nodeId` - Expand concept node
- `GET /concept-map/:documentId/node/:nodeId` - Get node details

**Flashcards**
- `POST /flashcards/:documentId/create` - Generate flashcard deck
- `GET /flashcards/:deckId` - Get deck cards
- `GET /flashcards/:deckId/next` - Get next cards to study
- `POST /flashcards/:cardId/rate` - Rate card difficulty
- `GET /flashcards/:deckId/stats` - Get deck statistics

**Quizzes**
- `POST /quizzes/:documentId/generate` - Generate adaptive quiz
- `POST /quizzes/:quizId/start` - Start quiz session
- `POST /quizzes/:sessionId/submit-answer` - Submit answer
- `POST /quizzes/:sessionId/complete` - Complete quiz
- `GET /quizzes/:quizId/stats` - Get quiz statistics

**AI Tutor**
- `POST /tutor/chat` - Send message to tutor
- `POST /tutor/explain` - Explain specific passage
- `POST /tutor/conversation/start` - Start conversation
- `POST /tutor/conversation/:conversationId/message` - Send message in conversation

**API Playground**
- `POST /api-playground/test` - Test any API endpoint
- `GET /api-playground/templates` - Get request templates

### Project Structure

```
Cogni/
├── src/
│   ├── routes/          # API endpoints
│   ├── utils/           # Utilities (AI, parsing, engines)
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── store.js     # Zustand state management
│   │   └── App.jsx      # Main app component
│   └── ...
├── server.js            # Backend entry point
├── package.json         # Backend dependencies
└── .env.example         # Environment template
```

### Features

✅ **Document Upload** - PDF, DOCX, PPTX, TXT, Markdown, Images  
✅ **AI Extraction** - Auto-extract concepts, definitions, keywords  
✅ **Study Vault** - Organized learning materials  
✅ **Concept Maps** - Visual knowledge graphs  
✅ **Flashcards** - SM-2 spaced repetition algorithm  
✅ **Adaptive Quizzes** - AI-generated questions with difficulty scaling  
✅ **AI Tutor** - Real-time conversational learning  
✅ **API Playground** - Test REST endpoints interactively  
✅ **JWT Authentication** - Secure user sessions  
✅ **Rate Limiting** - Built-in protection against abuse  

### Development

**Backend Development**
```bash
npm run dev          # Watch mode with auto-reload
npm run start        # Production mode
npm run lint         # Run ESLint
```

**Frontend Development**
```bash
cd frontend
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Deployment

**Vercel** (Frontend)
```bash
cd frontend
npm run build
# Push to GitHub and connect to Vercel
```

**Railway/Render** (Backend)
1. Push repository to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Support & Issues

For issues or questions:
- Check the troubleshooting section above
- Review API documentation
- Create an issue on GitHub

### License

MIT License - See LICENSE file for details
