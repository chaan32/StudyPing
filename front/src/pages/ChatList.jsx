"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { MessageSquare } from "../components/icons/Icons"

function ChatList() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const { chatRooms, fetchChatRooms, loading, error, testApiEndpoints } = useChat()

  // 컴포넌트가 마운트될 때 채팅방 목록 가져오기
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchChatRooms()
    }
  }, [isLoggedIn, user, fetchChatRooms])

  // API 테스트 실행
  const handleTestApi = () => {
    testApiEndpoints()
  }
  
  // 채팅방 목록 새로고침
  const handleRefresh = () => {
    fetchChatRooms()
  }

  // 채팅방으로 이동
  const goToChat = (type, id) => {
    navigate(`/chat/${type}/${id}`)
  }

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // 오늘
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      // 어제
      return "어제"
    } else if (diffDays < 7) {
      // 이번 주
      const days = ["일", "월", "화", "수", "목", "금", "토"]
      return days[date.getDay()] + "요일"
    } else {
      // 그 이전
      return `${date.getMonth() + 1}월 ${date.getDate()}일`
    }
  }

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
              <p className="text-gray-500 mb-6">채팅 목록을 확인하려면 로그인해주세요.</p>
              <button 
                onClick={() => navigate("/")} 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all">
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">채팅</h1>
            <div className="flex space-x-2">
              <button 
                onClick={handleRefresh}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-all"
              >
                새로고침
              </button>
              <button 
                onClick={handleTestApi}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded-md transition-all"
              >
                API 테스트
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <p className="font-medium">오류 발생</p>
              <p className="text-sm">{error}</p>
              <p className="text-sm mt-1">네트워크 연결 또는 백엔드 서버를 확인해 주세요.</p>
              <p className="text-xs mt-2 text-red-500">
                자세한 오류 정보는 개발자 도구 콘솔(F12)에서 확인하세요.
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 탭 */}
            <div className="flex border-b">
              <button className="flex-1 py-3 font-medium text-blue-500 border-b-2 border-blue-500">모든 채팅</button>
              <button className="flex-1 py-3 font-medium text-gray-500 hover:bg-gray-50">1:1 채팅</button>
              <button className="flex-1 py-3 font-medium text-gray-500 hover:bg-gray-50">그룹 채팅</button>
            </div>

            {/* 로딩 상태 */}
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-500">채팅방 목록을 불러오는 중...</p>
              </div>
            )}

            {/* 채팅방 목록 */}
            {!loading && (
              <div>
                <h2 className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">1:1 채팅</h2>
                {(!chatRooms.direct || chatRooms.direct.length === 0) ? (
                  <div className="p-4 text-center text-gray-500">1:1 채팅방이 없습니다.</div>
                ) : (
                  <ul>
                    {chatRooms.direct.map((room) => (
                      <li
                        key={room.id}
                        className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => goToChat("direct", room.id)}
                      >
                        <div className="flex items-center p-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-medium mr-3 flex-shrink-0">
                            {room.userAvatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">{room.userName}</h3>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {formatTime(room.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                          </div>
                          {room.unread > 0 && (
                            <div className="ml-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                              {room.unread}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <h2 className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border-t">그룹 채팅</h2>
                {(!chatRooms.group || chatRooms.group.length === 0) ? (
                  <div className="p-4 text-center text-gray-500">그룹 채팅방이 없습니다.</div>
                ) : (
                  <ul>
                    {chatRooms.group.map((room) => (
                      <li
                        key={room.id}
                        className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => goToChat("group", room.id)}
                      >
                        <div className="flex items-center p-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">{room.name}</h3>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {formatTime(room.timestamp)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{room.members}명</span>
                            </div>
                          </div>
                          {room.unread > 0 && (
                            <div className="ml-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                              {room.unread}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ChatList
