<div align="center">

# 🎥 MeetInVirtual

### *Next-Generation Video Conferencing Platform*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-47A248?logo=mongodb)](https://www.mongodb.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-orange)](https://webrtc.org/)

*A production-ready video conferencing app built with the MERN stack and WebRTC — featuring AI chat, a shared whiteboard, emoji reactions, host controls, and more.*

</div>

---

## ✨ Features

- 🔐 **Authentication** — Email/password + Google OAuth, OTP-based password reset
- 🎥 **Video Calling** — Peer-to-peer WebRTC with camera & mic toggles (hardware released when off)
- 🖥️ **Screen Sharing** — Share screen; camera restores automatically on stop
- 💬 **Live Chat** — Text messages, file sharing (up to 5 MB), chat history download
- 🤖 **AI Assistant** — `@ai <question>` for a quick answer, `#ai <question>` to include full chat context (Google Gemini, streaming)
- 🎨 **Shared Whiteboard** — Fabric.js canvas with pencil, shapes, text, eraser, undo/redo, PNG export; synced in real time
- 😂 **Emoji Reactions** — Animated floating emojis broadcast to all participants
- 📌 **Pin Participants** — Focus any remote user's video full-screen
- 👑 **Host Controls** — Lock room, mute/video-off participants, kick, transfer host
- 📜 **Meeting History** — Past meetings with one-click rejoin
- 📱 **Responsive** — Full desktop + mobile support with a compact mobile control bar

---

## 🛠️ Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Material-UI 7, React Router 7, Socket.IO Client, Fabric.js, Google GenAI, Vite |
| **Backend** | Node.js, Express 5, MongoDB + Mongoose, Socket.IO, Passport.js (Google OAuth), Nodemailer, Bcrypt |
| **Core** | WebRTC (RTCPeerConnection), STUN (Google), JWT / Crypto tokens |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18, MongoDB ≥ 4.4
- Google OAuth credentials
- Google Gemini API key *(for AI chat)*
- Gmail App Password *(for OTP emails)*

### Setup

```bash
git clone https://github.com/Princekr267/MeetinVirtual.git
cd MeetinVirtual

cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

**`backend/.env`**
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/meetinvirtual
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

**`frontend/.env`**
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_key
```

### Run

```bash
# Terminal 1
cd backend && npm run dev      # http://localhost:3000

# Terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

Verify email config: `cd backend && node src/test-email.js`

---

## 📖 Usage

### Meetings
- **Create** — click *Create an instant meeting* on the dashboard, or *Start Meeting* on the landing page (no account needed)
- **Join** — enter a 10-character code (e.g. `abc1234567`) and click *Join*
- **Share** — use the 📋 floating button (top-left in-call) to copy the meeting link

### In-Call Controls

| Control | Description |
|---------|-------------|
| 📹 / 🎤 | Toggle camera / microphone |
| 🖥️ | Screen share (camera restores on stop) |
| 💬 | Chat panel — text, files, AI assistant |
| 👥 | Participants panel + host controls |
| 🎨 | Shared whiteboard |
| 😂 | Emoji reactions |
| ❌ | Leave meeting |

> On mobile, screen share, participants, and whiteboard are in the **⋮ More** menu.

### AI Chat
- `@ai <question>` — direct question to Gemini
- `#ai <question>` — question with full chat transcript as context

### Whiteboard
Real-time collaborative canvas. Tools: Select, Pencil, Rectangle, Circle, Text, Eraser. Supports undo/redo, clear board, and PNG export. Late joiners receive the current board state automatically.

### Host Controls
First to join = host (★). From the Participants panel (hover a user):
**Lock room · Mute · Video off · Make host · Remove participant**

Host transfers automatically when the host leaves.

---

## 🌐 API Reference

Base URL: `http://localhost:3000/api/v1/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Create account |
| `POST` | `/login` | Login → returns token |
| `GET`  | `/profile` | Get profile |
| `GET`  | `/auth/google` | Google OAuth |
| `POST` | `/forgot-password/send-otp` | Send OTP to email |
| `POST` | `/forgot-password/verify-otp` | Verify OTP |
| `POST` | `/forgot-password/reset` | Set new password |
| `POST` | `/add_to_activity` | Save meeting to history |
| `GET`  | `/get_all_activity` | Get meeting history |

---

## 🔒 Security

- Bcrypt password hashing (10 rounds)
- OTP hashed before storage, 10-minute expiry
- Secure random 20-byte hex session tokens
- Server-side input validation + strict meeting code regex
- CORS allowlist, environment-based secrets
- WebRTC DTLS-SRTP end-to-end encrypted media

---

## 🚢 Deployment

```bash
# Build frontend
cd frontend && npm run build   # outputs dist/

# Run backend with PM2
cd backend && pm2 start src/app.js --name meetinvirtual
```

- Deploy `dist/` to Vercel / Netlify — included `vercel.json` handles SPA routing
- **WebRTC requires HTTPS in production** — use Let's Encrypt or Cloudflare
- For restrictive networks, add a TURN server to `peerConfig` in `VideoMeet/index.jsx`

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| MongoDB connection refused | `sudo systemctl start mongod` |
| OTP email not sending | `EMAIL_PASS` must be a Gmail App Password, not your login password |
| Camera/mic not working | Check browser + OS permissions; HTTPS required in production |
| No remote video | Check browser console for ICE errors; add TURN server on restrictive networks |
| Google OAuth redirect mismatch | Add `http://localhost:3000/api/v1/users/auth/google/callback` to authorized URIs in Google Console |


## 📄 License & Author

MIT License — see [LICENSE](LICENSE).

**Prince Kumar** · [GitHub](https://github.com/Princekr267) · [Email](mailto:princekrr267@gmail.com) · [LinkedIn](https://linkedin.com/in/princekr267)

<div align="center">

⭐ Star the repo if you find it useful!

[![Stars](https://img.shields.io/github/stars/Princekr267/ConferenceWorld?style=social)](https://github.com/Princekr267/ConferenceWorld/stargazers)

*Built with ❤️ using MERN · WebRTC · Socket.IO · Fabric.js — March 2026*

</div>