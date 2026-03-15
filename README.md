# Emolit - Emotion Tracking & Journaling Platform

A full-stack web application for tracking emotions, journaling, exploring emotional patterns, and daily affirmations. Built with modern technologies for seamless user experience and robust backend performance.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

**Emolit** is a comprehensive emotional intelligence platform that helps users:
- Track their daily emotions and moods
- Maintain a structured journal of experiences
- Explore emotions through an interactive emotion wheel
- Discover daily affirmations and motivational words
- Visualize emotional patterns over time
- Search through past journal entries and emotional history

The application provides a safe, intuitive space for emotional self-reflection with AI-powered insights and personalized recommendations.

---

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn (async ASGI)
- **Database**: MongoDB 4.x
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic 2.5.0
- **AI Integration**: OpenAI API
- **ORM/Client**: PyMongo 4.16.0

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **Routing**: React Router DOM 6.8.1
- **HTTP Client**: Axios 1.3.4
- **Styling**: Tailwind CSS 3.2.7
- **Icons**: Lucide React 0.323.0
- **Build Tool**: React Scripts 5.0.1

### Deployment
- **Containerization**: Docker & Docker Compose
- **Infrastructure**: Supports EC2, managed servers, or self-hosted

---

## 📁 Project Structure

```
emolit/
├── app/                              # Backend application
│   ├── main.py                      # FastAPI app entry point
│   ├── database.py                  # MongoDB connection & setup
│   ├── auth.py                      # JWT & password authentication
│   ├── auth_utils.py                # Authentication utilities
│   ├── auth_db.py                   # Auth-related database operations
│   ├── auth_routes.py               # Auth endpoints
│   ├── emotion_wheel.json           # Emotion classification data
│   ├── emotion_database.json        # Daily word & affirmation database
│   ├── data/                        # Additional data files
│   ├── models/                      
│   │   └── emotion_model.py         # Emotion ML/AI models
│   ├── routes/                      # API route handlers
│   │   ├── auth.py                  # Auth route variations
│   │   ├── tracker.py               # Emotion tracking endpoints
│   │   ├── journal.py               # Journal CRUD operations
│   │   ├── journal_history.py       # Journal history retrieval
│   │   ├── history.py               # Emotional history tracking
│   │   ├── emotions.py              # Emotion analysis endpoints
│   │   ├── daily_word.py            # Daily word/affirmation endpoints
│   │   └── words.py                 # Word database endpoints
│   ├── services/                    # Business logic layer
│   │   ├── ai_service.py            # OpenAI integration service
│   │   └── emotion_service.py       # Emotion processing & analysis
│   └── __pycache__/                 # Python cache
│
├── frontend/                        # React TypeScript frontend
│   ├── public/
│   │   ├── index.html               # Main HTML entry point
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── index.tsx                # React root component
│   │   ├── App.tsx                  # Main application component
│   │   ├── index.css                # Global styles
│   │   ├── navbar-premium.css       # Navbar styling
│   │   ├── setupProxy.js            # Proxy configuration for dev
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation component
│   │   │   └── ProtectedRoute.tsx   # Auth-protected route wrapper
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Global auth state management
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.tsx        # Authentication page
│   │   │   ├── HomePage.tsx         # Dashboard/home
│   │   │   ├── JournalPage.tsx      # Journal entry creation
│   │   │   ├── JournalHistoryPage.tsx # Past journal entries
│   │   │   ├── ExplorePage.tsx      # Emotion wheel explorer
│   │   │   ├── CalendarPage.tsx     # Calendar view of emotions
│   │   │   ├── SearchPage.tsx       # Search functionality
│   │   │   └── WordDetailPage.tsx   # Daily word details
│   │   └── services/
│   │       └── api.ts               # API client service
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   └── Dockerfile                   # Frontend Docker image
│
├── Dockerfile                       # Backend Docker image
├── docker-compose.yml               # Multi-container orchestration
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── start_backend.bat                # Backend startup script (Windows)
├── start_frontend.bat               # Frontend startup script (Windows)
├── docker_build_and_run.bat         # Docker build & run script
├── docker_cleanup.bat               # Docker cleanup script
│
├── Documentation Files
│   ├── AUTH_FIX_GUIDE.md           # Authentication troubleshooting
│   ├── JOURNAL_STORAGE.md          # Database schema documentation
│   ├── DOCKER_DEPLOYMENT.md        # Deployment guide
│   ├── DOCKER_INSTRUCTIONS.md      # Docker setup steps
│   ├── EC2_DEPLOY_COMMANDS.md      # AWS EC2 deployment
│   └── AUTHENTICATION.md            # Frontend auth documentation
│
└── Utility Scripts
    ├── check_journal_data.py        # Database inspection
    ├── inspect_users.py             # User data verification
    ├── test_db_connection.py        # DB connection testing
    ├── test_mongodb.py              # MongoDB functionality test
    ├── test_hashing.py              # Password hashing test
    ├── verify_mongo_data.py         # Data integrity check
    └── fix_calendar.js              # Frontend calendar fixes
```

---

## ✨ Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Emotion Tracking**: Log daily emotions with categorization
- **Journaling System**: Create, read, update, and delete journal entries
- **Emotion Wheel**: Interactive visualization of emotions
- **Calendar View**: See emotional patterns over time
- **Search**: Full-text search across journal entries
- **Daily Words**: AI-powered affirmations and motivational messages

### Advanced Features
- **AI Integration**: OpenAI API for intelligent emotion analysis
- **Emotional History**: Track emotional trends and patterns
- **Protected Routes**: Role-based access control on frontend
- **Real-time Sync**: Fast synchronization between frontend and backend
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

---

## 📦 Prerequisites

### Required
- **Node.js** 14.x or higher (for frontend development)
- **Python** 3.8 or higher (for backend)
- **MongoDB** 4.0+ (local instance or MongoDB Atlas connection)
- **Git** (for version control)

### Optional
- **Docker** & **Docker Compose** (for containerized deployment)
- **OpenAI API Key** (for AI-powered features)

### System Requirements
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 1GB minimum
- **OS**: Windows, macOS, or Linux

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd emolit
```

### 2. Backend Setup

#### Create Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 🔐 Environment Configuration

### Create `.env` File
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emolit?retryWrites=true&w=majority
MONGODB_DB=emolit

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# OpenAI API (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Server Configuration
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
```

### MongoDB Atlas Setup (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Copy the connection string and add to `.env`

### Local MongoDB Setup
If running MongoDB locally:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=emolit
```

---

## 🚀 Running the Project

### Option 1: Local Development (Recommended)

#### Terminal 1 - Start Backend
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

#### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```

Frontend will be available at: `http://localhost:3000`

### Option 2: Docker Compose (Production-like)

#### Build and Run with Docker Compose
```bash
docker-compose up --build
```

Or using the Windows batch script:
```bash
docker_build_and_run.bat
```

This will:
- Build backend image on port 8000
- Build frontend image on port 80
- Start MongoDB container (if included in compose)
- Set up networking between services

#### Stop Docker Services
```bash
docker-compose down

# Or using batch script:
docker_cleanup.bat
```

### Option 3: Windows Batch Scripts
```bash
# Start backend
start_backend.bat

# Start frontend (in new terminal)
start_frontend.bat
```

---

## 📡 API Overview

### Base URL
```
http://localhost:8000/api
```

### Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

#### Authentication
```
POST   /auth/register          - Create new user account
POST   /auth/login             - User login, returns JWT token
POST   /auth/logout            - User logout
GET    /auth/me                - Get current user data
POST   /auth/refresh           - Refresh JWT token
```

#### Journal
```
POST   /journal                - Create new journal entry
GET    /journal                - Get user's journal entries
GET    /journal/{id}           - Get specific journal entry
PUT    /journal/{id}           - Update journal entry
DELETE /journal/{id}           - Delete journal entry
GET    /journal/history        - Get journal history
```

#### Emotions
```
GET    /emotions               - Get emotion wheel data
GET    /emotions/track         - Track emotion entry
POST   /emotions/analyze       - AI emotion analysis
GET    /emotions/history       - Get emotional history
GET    /emotions/patterns      - Get emotion patterns over time
```

#### Daily Words
```
GET    /words/daily            - Get today's word/affirmation
GET    /words/{id}             - Get specific word details
GET    /words/explore          - Explore word database
```

#### Calendar
```
GET    /calendar               - Get calendar events (emotions)
GET    /calendar/{date}        - Get emotions for specific date
```

#### Search
```
GET    /search?q=query         - Search journal entries
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String,
  password_hash: String,
  username: String,
  created_at: Date,
  updated_at: Date,
  preferences: {
    notifications_enabled: Boolean,
    theme: String
  }
}
```

#### journal_entries
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  title: String,
  content: String,
  emotion_tags: [String],
  created_at: Date,
  updated_at: Date,
  mood_score: Number (1-10)
}
```

#### emotions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  emotion: String,
  intensity: Number (1-10),
  timestamp: Date,
  notes: String
}
```

#### daily_words
```javascript
{
  _id: ObjectId,
  word: String,
  category: String,
  meaning: String,
  affirmation: String,
  date: Date
}
```

---

## 🔑 Authentication System

### Flow
1. User registers with email and password
2. Password is hashed using bcrypt (never stored in plain text)
3. Upon login, system verifies credentials
4. JWT token is generated with 30-day expiration
5. Token is sent to frontend and stored in localStorage
6. Token is included in `Authorization: Bearer <token>` header for authenticated requests
7. Backend validates token on each protected request

### JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}
Payload: {
  "user_id": "user_objectid",
  "sub": "user_email",
  "exp": 1234567890,
  "iat": 1234567890
}
Signature: HMAC-SHA256(header.payload, SECRET_KEY)
```

### Protected Routes (Frontend)
All routes except login require valid JWT token. Protected with `ProtectedRoute` wrapper component.

---

## 🌐 Deployment

### Docker Deployment
See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed Docker setup.

### AWS EC2 Deployment
See [EC2_DEPLOY_COMMANDS.md](./EC2_DEPLOY_COMMANDS.md) for EC2 deployment steps.

### Quick Deployment Steps
1. Build Docker images: `docker-compose build`
2. Push to container registry (Docker Hub, ECR, etc.)
3. Deploy to cloud platform (AWS, Azure, GCP)
4. Set environment variables on deployment platform
5. Configure reverse proxy (Nginx/Apache)
6. Set up SSL/TLS certificates

### Environment for Production
```env
ENVIRONMENT=production
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
DEBUG=False
```

---

## 📚 Development Guidelines

### Code Structure Best Practices
- **Separation of Concerns**: Routes → Services → Database
- **Type Safety**: Use TypeScript on frontend, Pydantic models on backend
- **Error Handling**: Consistent error responses with proper HTTP codes
- **Logging**: Use structured logging for debugging

### Adding New Features

#### Backend (FastAPI)
1. Create database model in appropriate `*_db.py` file
2. Create Pydantic schema for validation
3. Implement service logic in `services/`
4. Create route handler in `routes/`
5. Add endpoint to `main.py` or create new router

#### Frontend (React)
1. Create component in `components/` or `pages/`
2. Add API call in `services/api.ts`
3. Update routing in `App.tsx` if new page
4. Add styling with Tailwind CSS classes

### Testing
- Backend: Run `python -m pytest app/tests/`
- Frontend: Run `npm test` in frontend directory
- Or use utility scripts: `test_db_connection.py`, `test_mongodb.py`

### Git Workflow
```bash
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "Add feature: description"
git push origin feature/feature-name
# Create pull request
```

### Code Style
- **Python**: Follow PEP 8 (use `black` for formatting)
- **TypeScript**: Use ESLint configuration
- **Comments**: Document complex logic, not obvious code

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
python test_db_connection.py

# Check MongoDB URI in .env
# Ensure IP is whitelisted in MongoDB Atlas
```

### JWT Token Issues
```bash
# Verify token secret key is set
# Check token expiration
# Clear localStorage and re-login
```

### Frontend API Connection
- Check `setupProxy.js` configuration
- Verify backend is running on port 8000
- Check browser console for CORS errors

### Docker Issues
```bash
# Clean up containers and images
docker_cleanup.bat

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

---

## 📝 Important Files to Know

| File | Purpose |
|------|---------|
| `app/main.py` | Backend entry point |
| `app/auth.py` | Authentication & JWT logic |
| `app/database.py` | MongoDB connection |
| `app/routes/` | All API endpoints |
| `frontend/src/App.tsx` | Frontend root component |
| `frontend/src/contexts/AuthContext.tsx` | Client-side auth state |
| `docker-compose.yml` | Service orchestration |
| `.env` | Configuration (DO NOT commit) |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request
6. Ensure all tests pass before merging

---

## 📄 License

[Add appropriate license information]

---

## 📞 Support

For issues or questions:
- Check existing documentation files in the root directory
- Review API documentation at `http://localhost:8000/docs`
- Check browser console and backend logs for error details
- Use utility scripts for debugging

---

**Last Updated**: March 2026
**Project Version**: 1.0.0
