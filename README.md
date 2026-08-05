# Cogni - AI-Powered Interactive Study Engine

## Overview

Cogni is a comprehensive AI-driven learning platform that combines document parsing, automated study vault extraction, dynamic concept mapping, active recall tools, and an interactive development playground into a unified workspace.

## 🎯 Core Features

### 1. 📄 Multi-Document Upload & Processing
- Support for PDF, DOCX, PPTX, TXT, Markdown, and Images
- Gemini AI Deep Scan for automatic extraction of key concepts
- Document versioning and history tracking

### 2. 📚 Study Vault
- **Definitions Matrix**: Categorize terms by learning stage (New, Growing, Mastered)
- **Keyword Frequency Index**: Identify high-importance vocabulary
- **Visual Diagrams**: Auto-extracted and SVG-rendered architecture maps
- **Review Questions**: Auto-generated self-assessment prompts
- **Procedural Tables**: Real-world examples and case studies

### 3. 🕸️ Interactive Concept Map
- D3-powered visual knowledge graph
- Dynamic node expansion with AI-assisted concept generation
- Relationship labeling and visualization
- Node inspection with deep contextual information

### 4. 🎴 Active Recall Hub
- **Flashcard System**: 3D flip cards with mastery tracking
- **Adaptive Quiz Engine**: AI-generated questions tailored to learning stage
- **Spaced Repetition**: Intelligent review scheduling
- **Performance Analytics**: Track recall improvement over time

### 5. 🤖 AI Study Tutor
- Context-grounded conversational interface
- Passage explainer for instant text clarification
- Multi-turn dialogue for deeper understanding

### 6. 💻 DevTrack Playground
- Interactive code execution sandbox
- Architecture diagram viewer (SVG-based)
- ASP.NET/REST API playground with request tester
- Real-time HTTP request/response inspection

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- Google Gemini AI API
- Multer for file uploads
- PDF.js, Mammoth, Sharp for document processing

**Frontend:**
- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- D3.js for concept mapping
- Three.js for 3D flashcard animations

**Infrastructure:**
- Express Rate Limiting
- CORS & Helmet for security
- Compression middleware
- Morgan for logging

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API Key

### Setup

```bash
# Clone repository
git clone https://github.com/linaremosoeu-ai/Cogni.git
cd Cogni

# Install dependencies
npm run install:all

# Configure environment
cp .env.example .env
# Edit .env with your API keys and configuration

# Start development server
npm run dev

# Start frontend (in separate terminal)
cd frontend
npm run dev
```

## 💡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Documents
- `POST /api/documents/upload` - Upload study material
- `GET /api/documents` - List user documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

### Study Vault
- `GET /api/study-vault/:documentId` - Get extracted study materials
- `POST /api/study-vault/:documentId/extract` - Trigger Gemini deep scan
- `PUT /api/study-vault/:documentId/terms` - Update term mastery

### Concept Map
- `GET /api/concept-map/:documentId` - Get concept graph
- `POST /api/concept-map/:documentId/expand` - AI-expand node concepts
- `GET /api/concept-map/:documentId/node/:nodeId` - Get node details

### Flashcards
- `GET /api/flashcards/:documentId` - Get flashcard deck
- `POST /api/flashcards/:documentId/create` - Generate flashcards
- `PUT /api/flashcards/:cardId/rate` - Rate card difficulty

### Quizzes
- `POST /api/quizzes/:documentId/generate` - Generate adaptive quiz
- `POST /api/quizzes/:quizId/submit` - Submit quiz answers
- `GET /api/quizzes/:quizId/results` - Get quiz results

### AI Tutor
- `POST /api/tutor/chat` - Send tutor message
- `POST /api/tutor/explain` - Explain passage

### API Playground
- `POST /api/api-playground/test` - Test API endpoints
- `GET /api/api-playground/templates` - Get request templates

## 🔐 Environment Variables

```
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
STORAGE_PATH=./uploads
```

## 🚀 Deployment

### Docker
```bash
docker build -t cogni .
docker run -p 5000:3000 --env-file .env cogni
```

### Vercel/Railway/Render
1. Push to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

## 📊 Performance & Reliability

- **Resilient Model Cascade**: Automatic fallback through Gemini model tiers
- **Zero-Downtime Extraction**: All parsing operations guaranteed to return valid data
- **Rate Limiting**: Built-in protection against abuse
- **Compression**: Automatic response compression
- **Security**: Helmet, CORS, input validation

## 🛣️ Development Roadmap

- [ ] PostgreSQL integration for persistent storage
- [ ] User authentication with email verification
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Collaborative study groups
- [ ] Achievement/gamification system

## 📝 Contributing

Contributions welcome! Please follow our code style and submit PRs.

## 📄 License

MIT License - See LICENSE file

## 🤝 Support

For issues, questions, or feedback, open a GitHub issue or contact the team.