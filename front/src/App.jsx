import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateStudyGroup from "./pages/CreateStudyGroup"
import BrowseStudyGroups from "./pages/BrowseStudyGroups"
import StudyGroupDetail from "./pages/StudyGroupDetail"
import MyStudies from "./pages/MyStudies"
import ChatList from "./pages/ChatList"
import ChatRoom from "./pages/ChatRoom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"
import PrivateRoute from "./components/PrivateRoute"

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<PrivateRoute><CreateStudyGroup /></PrivateRoute>} />
          <Route path="/browse" element={<BrowseStudyGroups />} />
          <Route path="/study/:id" element={<PrivateRoute><StudyGroupDetail /></PrivateRoute>} />
          <Route path="/my-studies" element={<PrivateRoute><MyStudies /></PrivateRoute>} />
          <Route path="/chats" element={<PrivateRoute><ChatList /></PrivateRoute>} />
          <Route path="/chat/:type/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
