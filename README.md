# ConferenceWorld 📹

A full-stack real-time video conferencing application built with the MERN stack and WebRTC technology. Experience seamless video calls with features like screen sharing, real-time chat, and meeting history tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-blue)

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login with token-based authentication
- 🎥 **Real-time Video Calling** - High-quality peer-to-peer video communication using WebRTC
- 🎤 **Audio Control** - Toggle microphone on/off during calls
- 📹 **Video Control** - Enable/disable camera as needed
- 🖥️ **Screen Sharing** - Share your screen with meeting participants
- 💬 **Live Chat** - Text messaging during video calls
- **AI in the chat** - Ask "@ai" anything during live calls
- 📝 **Meeting History** - Track all your past meetings
- 🔗 **Easy Meeting Access** - Join meetings using simple meeting codes
- 📱 **Responsive Design** - Works seamlessly across devices

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **React Router DOM 7.13.0** - Client-side routing
- **Material-UI (MUI) 7.3.7** - Component library for beautiful UI
- **Socket.IO Client 4.8.3** - Real-time communication
- **Axios 1.13.4** - HTTP client for API requests
- **Vite 7.2.4** - Fast build tool and dev server

### Backend
- **Node.js with Express 5.2.1** - Server framework
- **MongoDB with Mongoose 9.1.5** - Database
- **Socket.IO 4.8.3** - WebSocket communication
- **Bcrypt 6.0.0** - Password hashing
- **CORS 2.8.6** - Cross-origin resource sharing

### Core Technologies
- **WebRTC** - Peer-to-peer video/audio streaming
- **STUN Server** - NAT traversal (Google's stun.l.google.com:19302)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/apna-video-call.git
cd apna-video-call
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (if not running as service)
# On Windows: net start MongoDB
# On macOS/Linux: sudo systemctl start mongod

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173` (or the port shown in terminal)

## 📖 Usage

### Getting Started

1. **Register an Account**
   - Open your browser and navigate to `http://localhost:5173`
   - Click on "Get Started" or navigate to `/auth`
   - Fill in your details and register

2. **Login**
   - Use your credentials to log in
   - You'll be redirected to the home dashboard

3. **Join a Meeting**
   - Enter a meeting code in the input field
   - Click "Join" to enter the meeting room
   - Allow camera and microphone permissions when prompted
   - Enter your display name in the lobby
   - Click "Connect" to join the call

4. **Start a New Meeting**
   - Create any unique meeting code
   - Share this code with participants
   - They can join using the same code

### During a Call

- 🎥 **Toggle Video**: Click the camera icon to turn video on/off
- 🎤 **Toggle Audio**: Click the microphone icon to mute/unmute
- 🖥️ **Share Screen**: Click the screen share icon to share your screen
- 💬 **Open Chat**: Click the chat icon to send messages
- ❌ **End Call**: Click the red phone icon to leave the meeting

### View History

- Click the history icon in the navigation bar
- See all your past meetings with dates
- Click "Join Again" to rejoin any previous meeting

## 📁 Project Structure

```
apna-video-call/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Main server file
│   │   ├── controllers/
│   │   │   ├── user.controller.js    # User authentication logic
│   │   │   └── socketManager.js      # Socket.IO event handlers
│   │   ├── models/
│   │   │   ├── user.model.js         # User schema
│   │   │   └── meeting.model.js      # Meeting schema
│   │   └── routes/
│   │       └── users.routes.js       # API routes
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   ├── pages/
│   │   │   ├── landing.jsx           # Landing page
│   │   │   ├── authentication.jsx    # Login/Register
│   │   │   ├── home.jsx              # Dashboard
│   │   │   ├── VideoMeet.jsx         # Video call interface
│   │   │   ├── history.jsx           # Meeting history
│   │   │   └── components/           # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── utils/
│   │   │   └── withAuth.jsx          # Auth HOC
│   │   └── styles/                   # CSS files
│   └── package.json
│
└── README.md
```

## 🔧 Configuration

### Backend Configuration

Update these settings in `backend/src/app.js` if needed:

```javascript
// Server port
app.set("port", (process.env.PORT || 3000));

// MongoDB connection string
const connectionDB = await mongoose.connect('mongodb://127.0.0.1:27017/fakeZoom');
```

### Frontend Configuration

Update these URLs when deploying:

**In `src/context/AuthContext.jsx`:**
```javascript
const client = axios.create({
    baseURL: "http://localhost:3000/api/v1/users"
})
```

**In `src/pages/VideoMeet.jsx`:**
```javascript
const server_url = "http://localhost:3000";
```

## 🌐 API Endpoints

### User Routes (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new user account |
| POST | `/login` | Authenticate user and return token |
| POST | `/add_to_activity` | Add meeting to user's history |
| GET | `/get_all_activity` | Retrieve user's meeting history |

## 🎯 WebRTC Flow

1. User joins meeting room via Socket.IO
2. Server notifies existing participants
3. New user creates RTCPeerConnection for each participant
4. Peers exchange SDP offers/answers via Socket.IO signaling
5. ICE candidates are exchanged for NAT traversal
6. Direct peer-to-peer connection established
7. Audio/video streams flow directly between peers

## 🔒 Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- Token-based authentication for API requests
- Protected routes using Higher-Order Components
- CORS enabled for cross-origin requests

## 🚢 Production Deployment

### Backend

```bash
cd backend
npm start  # Uses node instead of nodemon

# Or using PM2
npm run prod
```

### Frontend

```bash
cd frontend
npm run build  # Creates optimized production build in /dist

# Deploy the /dist folder to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

### Environment Variables

For production, set these environment variables:

**Backend:**
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV=production`

**Frontend:**
- Update API URLs in code before building
- Or use environment variables with Vite

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### WebRTC Not Working
- Ensure you're using HTTPS in production (WebRTC requires secure context)
- Check browser permissions for camera and microphone
- Verify STUN server is accessible

### Camera/Microphone Permissions
- Allow permissions when browser prompts
- Check system settings for camera/microphone access
- Try using a different browser (Chrome/Firefox recommended)

## Future Enhancements
- [x] AI in chat
- [x] Download chat
- [x] better meeting code
- [x] better UI
- [ ] white board or notepad
- [ ] upload documents

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Prince**

- GitHub: [@Princekr267](https://github.com/Princekr267)

## 🙏 Acknowledgments

- WebRTC documentation and community
- Socket.IO team for excellent real-time communication library
- Material-UI for the beautiful component library
- MongoDB for robust database solution

## 📧 Support

For support, email princekrr267@gmail.com or open an issue in the repository.

---

⭐ If you found this project helpful, please give it a star!

**Built with ❤️ using MERN Stack and WebRTC**