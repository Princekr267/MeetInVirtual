<div align="center">

# 🎥 ConferenceWorld

### *Next-Generation Video Conferencing Platform*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-47A248?logo=mongodb)](https://www.mongodb.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-orange)](https://webrtc.org/)

*A production-ready, feature-rich video conferencing application built with the MERN stack and WebRTC. Experience crystal-clear video calls, AI-powered chat, real-time collaboration, and much more!*

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation--setup) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- **Secure User Authentication** - JWT-based authentication with bcrypt password hashing
- **Google OAuth 2.0** - Sign in seamlessly with your Google account
- **Password Recovery** - Reset forgotten passwords via email with secure tokens
- **Protected Routes** - HOC-based route protection for secure access

### 🎥 Video Conferencing
- **HD Video Calling** - Crystal-clear peer-to-peer video using WebRTC technology
- **Multi-Party Calls** - Support for multiple participants in a single room
- **Audio/Video Controls** - Toggle camera and microphone with beautiful animations
- **Screen Sharing** - Share your entire screen or specific application windows
- **Elegant Lobby** - Preview and test your audio/video before joining
- **Beautiful Video Tiles** - Stunning UI with avatar fallbacks when camera is off

### 👥 Meeting Management
- **Host Controls** - Lock rooms, remove participants, and manage meetings (host-only)
- **Participants Panel** - See all participants with real-time status indicators
- **Unique Room Codes** - Auto-generated secure meeting codes
- **Meeting History** - Track and rejoin all your past meetings
- **Easy Room Sharing** - One-click copy meeting links to invite others

### 💬 Real-Time Communication
- **Live Chat** - In-meeting text messaging with elegant bubble UI
- **AI Chat Assistant** - Powered by Google Gemini AI for instant help
- **File Sharing** - Share documents, images, and files during meetings
- **Download Chat History** - Export all your chat messages as a text file
- **Typing Indicators** - Real-time status updates

### 🎨 User Experience
- **Modern Glass-Morphism UI** - Beautiful gradients, blur effects, and animations
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Dark Theme** - Easy on the eyes with a sleek dark interface
- **Real-time Notifications** - Flash notifications for important events
- **Smooth Animations** - Polished transitions and micro-interactions

### 🚀 Performance & Reliability
- **Socket.IO Integration** - Real-time bidirectional communication
- **STUN Server Support** - NAT traversal for reliable connections
- **Optimized Rendering** - React 19 with efficient state management
- **Error Handling** - Comprehensive error handling and user feedback

## 🛠️ Technology Stack

<div align="center">

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| ⚛️ **React** | 19.2.0 | Modern UI library with hooks |
| 🎨 **Material-UI** | 7.3.7 | Comprehensive component library |
| 🔄 **React Router DOM** | 7.13.0 | Client-side routing |
| 🔌 **Socket.IO Client** | 4.8.3 | Real-time bidirectional communication |
| 🌐 **Axios** | 1.13.4 | Promise-based HTTP client |
| 🤖 **Google GenAI** | 1.45.0 | AI-powered chat assistant |
| ⚡ **Vite** | 7.2.4 | Next-gen build tool |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| 🟢 **Node.js + Express** | 5.2.1 | Fast, minimalist web framework |
| 🍃 **MongoDB + Mongoose** | 9.1.5 | NoSQL database with ODM |
| 🔌 **Socket.IO** | 4.8.3 | WebSocket server |
| 🔐 **Bcrypt** | 6.0.0 | Secure password hashing |
| 🔑 **Passport.js** | 0.7.0 | Authentication middleware |
| 🌍 **Passport Google OAuth** | 2.0.0 | Google authentication strategy |
| 📧 **Nodemailer** | 8.0.3 | Email sending for password reset |
| 🌐 **CORS** | 2.8.6 | Cross-origin resource sharing |
| 🔒 **Crypto** | 1.0.1 | Cryptographic functionality |

### Core Technologies

- **WebRTC** - Peer-to-peer audio/video/data streaming
- **STUN Server** - NAT traversal using Google's public STUN server
- **JWT** - JSON Web Tokens for secure authentication
- **REST API** - RESTful API architecture

</div>

## 📸 Demo

<div align="center">

### 🎬 *Coming Soon: Live Demo & Screenshots*

<!-- Add your screenshots here -->
<!-- ![Landing Page](./screenshots/landing.png) -->
<!-- ![Video Call](./screenshots/video-call.png) -->
<!-- ![Chat Interface](./screenshots/chat.png) -->

*Screenshots and live demo will be added soon!*

</div>

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (included with Node.js)
- **Google OAuth Credentials** (optional) - [Get credentials](https://console.cloud.google.com/)
- **Google Gemini API Key** (for AI chat) - [Get API key](https://ai.google.dev/)

---

## 🔧 Environment Variables

### Backend `.env` Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/conferenceWorld

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/users/google/callback

# Session Secret
SESSION_SECRET=your_random_session_secret_here

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@conferenceworld.com

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` Configuration

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Google Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **⚠️ Important:** Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 🚀 Installation & Setup

### Method 1: Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Princekr267/ConferenceWorld.git
cd ConferenceWorld

# 2. Install backend dependencies
cd backend
npm install

# 3. Create backend .env file (use template above)
cp .env.example .env
# Edit .env with your credentials

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Create frontend .env file (use template above)
cp .env.example .env
# Edit .env with your API keys

# 6. Start MongoDB (if not running as a service)
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# 7. Start the backend server (from backend directory)
cd ../backend
npm run dev
# Backend will run on http://localhost:3000

# 8. Start the frontend (open new terminal, from frontend directory)
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### Method 2: Manual Setup

### Method 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Princekr267/ConferenceWorld.git
cd ConferenceWorld
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file and add your credentials (see Environment Variables section)

# Ensure MongoDB is running
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# Start the development server
npm run dev
```

✅ Backend server will start on `http://localhost:3000`

#### 3. Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env file and add your API keys (see Environment Variables section)

# Start the development server
npm run dev
```

✅ Frontend application will start on `http://localhost:5173`

---

## 📖 Usage Guide

### 🎯 Getting Started

#### Option 1: Email/Password Authentication

1. **Register an Account**
   - Navigate to `http://localhost:5173`
   - Click **"Get Started"** or go to `/auth`
   - Fill in your details (name, email, password)
   - Click **"Register"**
   - Your password will be securely hashed with bcrypt

2. **Login**
   - Enter your email and password
   - Click **"Sign In"**
   - You'll receive a JWT token and be redirected to the dashboard

#### Option 2: Google OAuth

1. Click **"Sign in with Google"** on the auth page
2. Select your Google account
3. Grant permissions
4. You'll be automatically authenticated and redirected

#### Forgot Password?

1. Click **"Forgot Password?"** on the login page
2. Enter your email address
3. Check your email for a reset link
4. Click the link and set a new password
5. Login with your new credentials

### 🎥 Starting a Meeting

1. **Create a New Meeting**
   - From the dashboard, enter any unique meeting code (e.g., "team-standup-2024")
   - Click **"Create Meeting"**
   - Share the code with participants

2. **Join an Existing Meeting**
   - Enter the meeting code you received
   - Click **"Join Meeting"**

3. **Lobby Experience**
   - Test your camera and microphone
   - Enter your display name
   - Toggle video/audio before joining
   - Click **"Join Now"** when ready

### 🎮 In-Meeting Controls

<div align="center">

| Control | Icon | Description |
|---------|------|-------------|
| **Microphone** | 🎤 | Toggle audio on/off (mute/unmute) |
| **Camera** | 📹 | Toggle video on/off |
| **Screen Share** | 🖥️ | Share your screen with participants |
| **Chat** | 💬 | Open the chat panel |
| **Participants** | 👥 | View all meeting participants |
| **End Call** | ❌ | Leave the meeting |

</div>

### 💬 Using Chat Features

#### Send Messages
1. Click the **chat icon** in the control bar
2. Type your message in the input field
3. Press **Enter** or click the **send button**

#### AI Assistant Chat
1. Type your question or request
2. Mention **"AI"** or use a specific command
3. Get instant AI-powered responses from Google Gemini

#### Share Files
1. Click the **attachment icon** in the chat input
2. Select a file from your device
3. File will be shared with all participants
4. Participants can download the file directly

#### Download Chat History
1. Click the **download icon** in the chat header
2. All messages will be exported as a `.txt` file
3. File includes timestamps and sender names

### 👑 Host Controls

If you're the meeting host:

- **Lock Room** 🔒 - Prevent new participants from joining
- **Remove Participants** 👤❌ - Remove disruptive participants
- **Manage Permissions** - Control who can share screen, chat, etc.

### 📜 View Meeting History

1. Click the **history icon** in the navigation bar
2. See all your past meetings with:
   - Meeting code
   - Date and time
   - Duration
3. Click **"Join Again"** to rejoin any previous meeting

---

## 📁 Project Structure

```
ConferenceWorld/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📄 app.js                          # Express server & Socket.IO setup
│   │   │
│   │   ├── 📂 controllers/
│   │   │   ├── 📄 user.controller.js          # Auth, registration, login logic
│   │   │   └── 📄 socketManager.js            # Socket events & WebRTC signaling
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── 📄 user.model.js               # User schema (auth, Google OAuth)
│   │   │   └── 📄 meeting.model.js            # Meeting history schema
│   │   │
│   │   ├── 📂 routes/
│   │   │   └── 📄 users.routes.js             # API endpoints
│   │   │
│   │   ├── 📂 config/
│   │   │   └── 📄 passport.js                 # Google OAuth strategy config
│   │   │
│   │   ├── 📂 utils/
│   │   │   └── 📄 mailer.js                   # Email sending (password reset)
│   │   │
│   │   └── 📄 test-email.js                   # Email testing utility
│   │
│   ├── 📄 package.json                        # Backend dependencies
│   ├── 📄 .env                                # Environment variables
│   └── 📄 .gitignore
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📄 main.jsx                        # React entry point
│   │   ├── 📄 App.jsx                         # Root component with routing
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── 📄 landing.jsx                 # Landing page
│   │   │   ├── 📄 authentication.jsx          # Login/Register page
│   │   │   ├── 📄 home.jsx                    # Dashboard
│   │   │   ├── 📄 history.jsx                 # Meeting history
│   │   │   ├── 📄 ForgotPassword.jsx          # Password reset page
│   │   │   ├── 📄 GoogleAuthCallback.jsx      # OAuth callback handler
│   │   │   │
│   │   │   ├── 📂 VideoMeet/                  # Video call module
│   │   │   │   ├── 📄 index.jsx               # Main video call container
│   │   │   │   │
│   │   │   │   ├── 📂 components/
│   │   │   │   │   ├── 📄 Lobby.jsx           # Pre-call lobby
│   │   │   │   │   ├── 📄 VideoTile.jsx       # Individual video/avatar tile
│   │   │   │   │   ├── 📄 ControlBar.jsx      # Meeting controls
│   │   │   │   │   ├── 📄 ChatPanel.jsx       # Chat & AI assistant
│   │   │   │   │   ├── 📄 ParticipantsPanel.jsx # Participants list
│   │   │   │   │   └── 📄 ConfirmDialog.jsx   # Confirmation dialogs
│   │   │   │   │
│   │   │   │   └── 📂 utils/
│   │   │   │       └── 📄 mediaHelpers.js     # Media stream utilities
│   │   │   │
│   │   │   └── 📂 components/
│   │   │       ├── 📄 Navbar.jsx              # Navigation bar
│   │   │       ├── 📄 SignInCard.jsx          # Sign-in form component
│   │   │       └── 📄 ForgotPassword.jsx      # Password reset form
│   │   │
│   │   ├── 📂 context/
│   │   │   └── 📄 AuthContext.jsx             # Auth state management
│   │   │
│   │   ├── 📂 utils/
│   │   │   └── 📄 withAuth.jsx                # HOC for protected routes
│   │   │
│   │   ├── 📂 styles/
│   │   │   ├── 📄 App.css                     # Global styles
│   │   │   ├── 📄 home.css                    # Dashboard styles
│   │   │   ├── 📄 videoComponent.css          # Video call styles
│   │   │   ├── 📄 auth.css                    # Authentication styles
│   │   │   └── 📄 ...
│   │   │
│   │   └── 📂 assets/                         # Images, icons, etc.
│   │
│   ├── 📄 package.json                        # Frontend dependencies
│   ├── 📄 vite.config.js                      # Vite configuration
│   ├── 📄 .env                                # Environment variables
│   └── 📄 .gitignore
│
├── 📄 README.md                               # This file
├── 📄 LICENSE                                 # MIT License
└── 📄 .gitignore                              # Git ignore rules
```

---

## ⚙️ Configuration

### Backend Configuration (`backend/src/app.js`)

```javascript
// Server Port
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/conferenceWorld';

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### Frontend Configuration

**API Client (`src/context/AuthContext.jsx`):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const client = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/users`
});
```

**Socket Connection (`src/pages/VideoMeet/index.jsx`):**
```javascript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
const socket = io(SOCKET_URL);
```

**AI Configuration:**
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

---

## 🌐 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register New User
```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "code": 201
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "code": 200
}
```

#### Google OAuth Login
```http
GET /users/google
```
Redirects to Google OAuth consent screen.

#### Google OAuth Callback
```http
GET /users/google/callback
```
Handles OAuth callback and redirects to frontend.

#### Forgot Password
```http
POST /users/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /users/reset-password/:token
Content-Type: application/json

{
  "password": "newSecurePassword123"
}
```

### Meeting History Endpoints

#### Add Meeting to History
```http
POST /users/add_to_activity
Authorization: Bearer {token}
Content-Type: application/json

{
  "meetingCode": "team-standup-2024"
}
```

#### Get All Meetings
```http
GET /users/get_all_activity
Authorization: Bearer {token}
```

**Response:**
```json
{
  "meetings": [
    {
      "id": "507f1f77bcf86cd799439012",
      "meetingCode": "team-standup-2024",
      "createdAt": "2026-03-22T10:30:00.000Z"
    }
  ],
  "code": 200
}
```

### Socket.IO Events

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join-room` | Join a meeting room | `{ roomId, userName }` |
| `webrtc-signal` | Send WebRTC signaling data | `{ to, signal }` |
| `send-message` | Send chat message | `{ message, sender }` |
| `toggle-audio` | Update audio status | `{ userId, audioEnabled }` |
| `toggle-video` | Update video status | `{ userId, videoEnabled }` |
| `screen-share-start` | Start screen sharing | `{ userId }` |
| `screen-share-stop` | Stop screen sharing | `{ userId }` |
| `leave-room` | Leave the meeting | `{ roomId, userId }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `user-joined` | New user joined room | `{ userId, userName }` |
| `user-left` | User left room | `{ userId }` |
| `receive-signal` | Receive WebRTC signal | `{ from, signal }` |
| `receive-message` | Receive chat message | `{ message, sender, timestamp }` |
| `user-audio-status` | User audio status changed | `{ userId, audioEnabled }` |
| `user-video-status` | User video status changed | `{ userId, videoEnabled }` |
| `room-locked` | Host locked the room | `{ roomId }` |
| `participant-removed` | Participant was removed | `{ userId, reason }` |

---

## 🎯 WebRTC Architecture

### Connection Flow

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   User A    │                    │   Server    │                    │   User B    │
│  (Browser)  │                    │ (Socket.IO) │                    │  (Browser)  │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                  │                                  │
       │ 1. join-room                     │                                  │
       ├─────────────────────────────────>│                                  │
       │                                  │                                  │
       │ 2. room-users (User B exists)    │                                  │
       │<─────────────────────────────────┤                                  │
       │                                  │                                  │
       │ 3. Create RTCPeerConnection      │                                  │
       │ 4. createOffer()                 │                                  │
       │                                  │                                  │
       │ 5. webrtc-signal (offer)         │                                  │
       ├─────────────────────────────────>│ 6. Forward signal                │
       │                                  ├─────────────────────────────────>│
       │                                  │                                  │
       │                                  │ 7. Create RTCPeerConnection      │
       │                                  │ 8. createAnswer()                │
       │                                  │                                  │
       │                                  │ 9. webrtc-signal (answer)        │
       │ 10. Forward signal               │<─────────────────────────────────┤
       │<─────────────────────────────────┤                                  │
       │                                  │                                  │
       │ 11. Exchange ICE candidates      │ 12. Exchange ICE candidates      │
       │<────────────────────────────────────────────────────────────────────>│
       │                                  │                                  │
       │ 13. 🎥 Direct P2P Connection Established                            │
       │<═══════════════════════════════════════════════════════════════════>│
       │           Media streams flow directly between peers                  │
       │           (Audio, Video, Screen Share via DataChannel)               │
       └─────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **STUN Server** (`stun:stun.l.google.com:19302`)
   - Discovers public IP address
   - Enables NAT traversal
   - Facilitates peer discovery

2. **Signaling Server** (Socket.IO)
   - Exchanges SDP offers/answers
   - Relays ICE candidates
   - Manages room state

3. **Peer Connections** (RTCPeerConnection)
   - Establishes direct P2P connection
   - Handles media streams
   - Manages data channels

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ **Password Hashing** - Bcrypt with 10 salt rounds
- ✅ **JWT Tokens** - Secure stateless authentication
- ✅ **OAuth 2.0** - Google authentication integration
- ✅ **Protected Routes** - HOC-based route protection
- ✅ **Session Management** - Secure session handling
- ✅ **Password Reset Tokens** - Time-limited, single-use tokens

### Data Security
- ✅ **HTTPS Ready** - Secure transport layer for production
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Environment Variables** - Sensitive data stored securely
- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **Email Verification** - Confirmation links for password resets

### WebRTC Security
- ✅ **Peer-to-Peer Encryption** - DTLS-SRTP for media streams
- ✅ **STUN/TURN Support** - Secure NAT traversal
- ✅ **Host Controls** - Room locking and participant removal
- ✅ **Permission Management** - Granular control over meeting features

---

## 🚢 Production Deployment

### Prerequisites for Production

- ✅ Domain name with SSL certificate (Let's Encrypt recommended)
- ✅ MongoDB Atlas or self-hosted MongoDB
- ✅ Node.js hosting (Heroku, AWS, DigitalOcean, etc.)
- ✅ Static hosting for frontend (Vercel, Netlify, AWS S3)
- ✅ TURN server (optional, for better connectivity)

### Backend Deployment

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend directory
cd backend

# Start with PM2
pm2 start src/app.js --name "conference-world-api"

# Enable startup script
pm2 startup
pm2 save

# Monitor logs
pm2 logs conference-world-api
```

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

```bash
# Build and run
docker build -t conference-world-backend .
docker run -p 3000:3000 --env-file .env conference-world-backend
```

#### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/conferenceWorld
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdom.com/api/v1/users/google/callback
SESSION_SECRET=your_super_secret_random_string
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://yourdom.com
```

### Frontend Deployment

#### Build for Production

```bash
cd frontend

# Update .env with production URLs
# VITE_API_URL=https://api.yourdom.com
# VITE_SOCKET_URL=https://api.yourdom.com

# Create optimized build
npm run build
```

The `dist/` folder contains your production-ready app.

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

#### Deploy to AWS S3 + CloudFront

```bash
# Install AWS CLI
# Configure: aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### SSL/TLS Configuration

**For WebRTC to work in production, you MUST use HTTPS.** Use:
- Let's Encrypt (free, automated)
- Cloudflare SSL
- AWS Certificate Manager

### TURN Server Setup (Optional but Recommended)

For better connectivity in restrictive networks:

```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=username:password
realm=yourdom.com
```

Update your WebRTC configuration:
```javascript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:yourdom.com:3478',
    username: 'username',
    credential: 'password'
  }
];
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

<details>
<summary><strong>❌ MongoDB Connection Failed</strong></summary>

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB
# or
sc query MongoDB

# macOS with Homebrew:
brew services start mongodb-community

# Linux (systemd):
sudo systemctl status mongod
sudo systemctl start mongod

# Manually start MongoDB:
mongod --dbpath /path/to/data/db
```

**Verify connection:**
```bash
mongosh
# Should connect to MongoDB shell
```
</details>

<details>
<summary><strong>🔌 Port Already in Use</strong></summary>

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (use PID from above)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or using fuser
fuser -k 3000/tcp
```
</details>

<details>
<summary><strong>📹 Camera/Microphone Not Working</strong></summary>

**Checklist:**

1. **Browser Permissions**
   - Click the 🔒 lock icon in the address bar
   - Ensure Camera and Microphone are set to "Allow"

2. **System Permissions**
   - Windows: Settings → Privacy → Camera/Microphone
   - macOS: System Preferences → Security & Privacy → Camera/Microphone
   - Check that your browser has access

3. **HTTPS Required**
   - WebRTC requires HTTPS in production
   - Localhost works without HTTPS for development

4. **Device Check**
   ```javascript
   // Test in browser console
   navigator.mediaDevices.enumerateDevices()
     .then(devices => console.log(devices));
   ```

5. **Browser Compatibility**
   - Use Chrome 74+ or Firefox 66+
   - Safari 12.1+ on macOS
   - Edge 79+
</details>

<details>
<summary><strong>🌐 WebRTC Connection Failed</strong></summary>

**Symptoms:** No video/audio between peers

**Solutions:**

1. **Check STUN Server**
   ```javascript
   // Test STUN connectivity
   const pc = new RTCPeerConnection({
     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
   });
   ```

2. **Firewall/Network Issues**
   - Ensure UDP ports are not blocked
   - Try connecting from a different network
   - Use a TURN server for restrictive networks

3. **Check Browser Console**
   - Look for ICE candidate errors
   - Check for signaling errors

4. **Verify Socket Connection**
   ```javascript
   // In browser console
   console.log(socket.connected);  // Should be true
   ```
</details>

<details>
<summary><strong>🔑 Google OAuth Not Working</strong></summary>

**Error:** `Redirect URI mismatch` or `Invalid client ID`

**Solutions:**

1. **Verify Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services → Credentials**

2. **Check Authorized Redirect URIs:**
   - Should include: `http://localhost:3000/api/v1/users/google/callback`
   - For production: `https://yourdomain.com/api/v1/users/google/callback`

3. **Verify .env File:**
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/users/google/callback
   ```

4. **Restart Backend Server** after changing credentials
</details>

<details>
<summary><strong>📧 Email Not Sending (Password Reset)</strong></summary>

**Error:** `Invalid login` or `Connection timeout`

**Solutions:**

1. **Gmail App Password:**
   - Enable 2FA on your Google account
   - Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Use App Password in `.env`, not your regular password

2. **Update `.env`:**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

3. **Test Email Configuration:**
   ```bash
   cd backend
   node src/test-email.js
   ```

4. **Alternative Providers:**
   - SendGrid, Mailgun, AWS SES for production
</details>

<details>
<summary><strong>⚛️ React Build Errors</strong></summary>

**Error:** `Cannot find module` or build failures

**Solutions:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev

# Check for peer dependency issues
npm install --legacy-peer-deps
```
</details>

<details>
<summary><strong>🚫 CORS Errors</strong></summary>

**Error:** `Access-Control-Allow-Origin` error

**Solutions:**

1. **Check Backend CORS Configuration:**
   ```javascript
   // backend/src/app.js
   const corsOptions = {
     origin: 'http://localhost:5173',  // Frontend URL
     credentials: true
   };
   app.use(cors(corsOptions));
   ```

2. **Verify Frontend Requests:**
   ```javascript
   // Include credentials
   axios.defaults.withCredentials = true;
   ```
</details>

### Performance Optimization

**If experiencing lag or poor quality:**

1. **Reduce Video Quality:**
   ```javascript
   const constraints = {
     video: {
       width: { ideal: 1280 },
       height: { ideal: 720 },
       frameRate: { ideal: 24 }  // Reduce from 30
     }
   };
   ```

2. **Limit Participants:**
   - Mesh topology works best for 4-8 participants
   - Consider SFU (Selective Forwarding Unit) for larger meetings

3. **Monitor Network:**
   - Check bandwidth: [Fast.com](https://fast.com)
   - Upload speed should be > 2 Mbps for HD video

---

## 📊 Performance & Browser Support

### Browser Compatibility

| Browser | Minimum Version | Recommended | Notes |
|---------|----------------|-------------|-------|
| Chrome | 74+ | Latest | ⭐ Best performance |
| Firefox | 66+ | Latest | ✅ Full support |
| Safari | 12.1+ | Latest | ⚠️ Some WebRTC limitations |
| Edge | 79+ | Latest | ✅ Full support |
| Opera | 62+ | Latest | ✅ Full support |
| Mobile Safari | 12.2+ | Latest | ⚠️ Limited functionality |
| Mobile Chrome | 74+ | Latest | ✅ Good support |

### System Requirements

**Minimum:**
- CPU: Dual-core 2.0 GHz
- RAM: 4 GB
- Network: 1 Mbps upload/download
- Browser: See compatibility table

**Recommended:**
- CPU: Quad-core 2.5 GHz+
- RAM: 8 GB+
- Network: 5+ Mbps upload/download
- Dedicated GPU (for screen sharing)

---

## 🎯 Roadmap & Future Enhancements

### ✅ Completed Features

- [x] HD video calling with WebRTC
- [x] Real-time chat messaging
- [x] **AI-powered chat assistant** (Google Gemini integration)
- [x] **Download chat history** as text file
- [x] **Google OAuth authentication**
- [x] **Password reset via email**
- [x] **File sharing in chat**
- [x] **Host controls** (lock room, remove participants)
- [x] **Participants panel** with status indicators
- [x] **Beautiful modern UI** with glass-morphism and animations
- [x] **Unique room codes** generation
- [x] Screen sharing
- [x] Meeting history tracking
- [x] Responsive mobile design

### 🚧 In Progress

- [ ] **Collaborative notepad/whiteboard** - Real-time document collaboration
- [ ] **Meeting recordings** - Record and save meetings
- [ ] **Virtual backgrounds** - Background blur and replacement

### 📋 Planned Features

#### High Priority
- [ ] **End-to-end encryption** - Enhanced privacy for sensitive meetings
- [ ] **Breakout rooms** - Split participants into smaller groups
- [ ] **Reactions & hand raise** - Non-verbal communication
- [ ] **Meeting scheduling** - Calendar integration (Google Calendar, Outlook)
- [ ] **Waiting room** - Host approval before joining
- [ ] **Meeting analytics** - Duration, participant count, engagement metrics

#### Medium Priority
- [ ] **Screen annotations** - Draw on shared screens
- [ ] **Polls & Surveys** - In-meeting participant feedback
- [ ] **Noise suppression** - AI-powered background noise removal
- [ ] **Live captions** - Speech-to-text transcription
- [ ] **Language translation** - Real-time message translation
- [ ] **Meeting templates** - Predefined settings for recurring meetings

#### Low Priority
- [ ] **Dark mode toggle** - User preference for theme
- [ ] **Participant search** - Quickly find participants in large meetings
- [ ] **Custom backgrounds** - Upload personal background images
- [ ] **Meeting minutes** - AI-generated summary of discussions
- [ ] **Integration APIs** - Slack, Microsoft Teams, Discord webhooks
- [ ] **Mobile apps** - Native iOS and Android applications

### 🎨 UI/UX Improvements

- [ ] Drag-and-drop file uploads
- [ ] Picture-in-Picture mode
- [ ] Grid/Speaker view toggle
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Custom meeting URLs (vanity URLs)

### 🏗️ Technical Improvements

- [ ] Migrate to SFU architecture for better scalability
- [ ] Redis for session management
- [ ] GraphQL API
- [ ] Kubernetes deployment configuration
- [ ] Automated testing (Jest, Cypress)
- [ ] Progressive Web App (PWA) support
- [ ] WebAssembly for performance optimization

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/ConferenceWorld.git
   cd ConferenceWorld
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: Add amazing feature"
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to the [original repository](https://github.com/Princekr267/ConferenceWorld)
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes
   - Link any related issues

### Development Guidelines

- **Code Style:** Follow consistent indentation and naming conventions
- **Testing:** Test your changes in multiple browsers
- **Documentation:** Update README if you add new features
- **No Breaking Changes:** Maintain backward compatibility
- **Security:** Never commit sensitive data (API keys, passwords)

### Reporting Bugs

Found a bug? Please open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Suggesting Features

Have an idea? Open an issue with:
- Feature description
- Use case and benefits
- Possible implementation approach
- Any relevant examples

---

## ❓ FAQ

<details>
<summary><strong>Q: Is this free to use?</strong></summary>
A: Yes! ConferenceWorld is open-source under the MIT License. You can use, modify, and distribute it freely.
</details>

<details>
<summary><strong>Q: Can I use this for commercial purposes?</strong></summary>
A: Yes, the MIT License allows commercial use. However, please review third-party service terms (Google OAuth, etc.) for any restrictions.
</details>

<details>
<summary><strong>Q: How many participants can join a meeting?</strong></summary>
A: The current mesh architecture works best with 4-8 participants. For larger meetings (10+), consider implementing SFU or MCU architecture.
</details>

<details>
<summary><strong>Q: Does this work on mobile devices?</strong></summary>
A: Yes! The UI is fully responsive. However, mobile browser WebRTC support varies. Works best on Chrome and Safari iOS 12.2+.
</details>

<details>
<summary><strong>Q: Do I need a TURN server?</strong></summary>
A: Not required for development or most networks. However, for production and restrictive corporate networks, a TURN server significantly improves connectivity.
</details>

<details>
<summary><strong>Q: Can I deploy this without Google OAuth?</strong></summary>
A: Yes! Email/password authentication works independently. Google OAuth is optional and can be disabled by not configuring the credentials.
</details>

<details>
<summary><strong>Q: How is this different from Zoom/Meet?</strong></summary>
A: This is an open-source, self-hosted alternative built for learning and customization. It's perfect for understanding WebRTC, building custom features, or deploying on your own infrastructure.
</details>

<details>
<summary><strong>Q: Is the AI chat assistant free?</strong></summary>
A: It uses Google Gemini's free tier. Check [Google AI pricing](https://ai.google.dev/pricing) for usage limits and costs.
</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Prince Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

<div align="center">

### Prince Kumar

[![GitHub](https://img.shields.io/badge/GitHub-Princekr267-black?logo=github)](https://github.com/Princekr267)
[![Email](https://img.shields.io/badge/Email-princekrr267%40gmail.com-red?logo=gmail)](mailto:princekrr267@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/princekr267)

*Full-Stack Developer | WebRTC Enthusiast | Open Source Contributor*

</div>

---

## 🙏 Acknowledgments

Huge thanks to the amazing open-source community and these projects:

- 🌐 **[WebRTC](https://webrtc.org/)** - For the revolutionary peer-to-peer technology
- ⚡ **[Socket.IO](https://socket.io/)** - Seamless real-time communication
- ⚛️ **[React](https://reactjs.org/)** - Powerful UI library
- 🎨 **[Material-UI](https://mui.com/)** - Beautiful component library
- 🍃 **[MongoDB](https://www.mongodb.com/)** - Flexible NoSQL database
- 🟢 **[Node.js](https://nodejs.org/)** - JavaScript runtime
- 🤖 **[Google Gemini AI](https://ai.google.dev/)** - AI-powered chat assistant
- 🔐 **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- 🌍 **[STUN/TURN Servers](https://www.google.com)** - NAT traversal

Special thanks to all contributors and the WebRTC community for excellent documentation and support!

---

## 📧 Support & Contact

Need help or have questions?

- 💬 **Discord:** [Join our server](#) *(Coming soon!)*
- 📧 **Email:** [princekrr267@gmail.com](mailto:princekrr267@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Princekr267/ConferenceWorld/issues)
- 💡 **Discussions:** [GitHub Discussions](https://github.com/Princekr267/ConferenceWold/discussions)

For bug reports and feature requests, please use GitHub Issues. For general questions and discussions, feel free to reach out via email or open a discussion thread.

---

<div align="center">

## ⭐ Show Your Support

If you find this project helpful or interesting, please consider giving it a star! ⭐

It helps the project grow and motivates continued development.

[![GitHub Stars](https://img.shields.io/github/stars/Princekr267/ConferenceWorld?style=social)](https://github.com/Princekr267/ConferenceWorld/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Princekr267/ConferenceWorld?style=social)](https://github.com/Princekr267/ConferenceWorld/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Princekr267/ConferenceWorld)](https://github.com/Princekr267/ConferenceWorld/issues)

---

### 🚀 Built with ❤️ using the MERN Stack, WebRTC, and Socket.IO

**[⬆ Back to Top](#-conferenceworld)**

---

*Last Updated: March 2026*

</div>