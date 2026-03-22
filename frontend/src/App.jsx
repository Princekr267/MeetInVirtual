import LandingPage from './pages/landing'
import './App.css'
import {Route, BrowserRouter as Router, Routes} from "react-router-dom"
import Authentication from './pages/authentication'
import { AuthProvider } from './context/AuthContext'
import VideoMeetComponent from './pages/VideoMeet'
import HomeComponent from './pages/home'
import History from './pages/history'
import Profile from './pages/Profile'
import GoogleAuthCallback from './pages/GoogleAuthCallback';


function App() {

  return (
    <>
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path='/auth' element={<Authentication/>}/>
          <Route path='/home' element={<HomeComponent/>}/>
          <Route path='/Profile' element={<Profile/>}/>
          <Route path="/:url" element={<VideoMeetComponent/>}/>
          <Route path='/history' element={<History/>}/>
          <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
        </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
