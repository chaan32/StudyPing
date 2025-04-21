import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateStudyGroup from "./pages/CreateStudyGroup"
import BrowseStudyGroups from "./pages/BrowseStudyGroups"
import StudyGroupDetail from "./pages/StudyGroupDetail"
import MyStudies from "./pages/MyStudies"
import ChatList from "./pages/ChatList"
import ChatRoom from "./pages/ChatRoom"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateStudyGroup />} />
          <Route path="/browse" element={<BrowseStudyGroups />} />
          <Route path="/study/:id" element={<StudyGroupDetail />} />
          <Route path="/my-studies" element={<MyStudies />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chat/:type/:id" element={<ChatRoom />} />
        </Routes>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
