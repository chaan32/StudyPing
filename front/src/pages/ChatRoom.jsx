"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { ArrowLeft } from "../components/icons/Icons"

function ChatRoom() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const { messages, sendMessage, chatRooms } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // 채팅방 ID를 숫자로 변환
  const chatId = Number.parseInt(id, 10)

  // 채팅 상대 정보 가져오기
  const getChatInfo = () => {
    if (!type || !chatId) return { title: "", subtitle: "" }

    if (type === "direct") {
      const room = chatRooms.direct.find((room) => room.id === chatId)
      return {
        title: room ? room.userName : "",
        subtitle: "1:1 채팅",
      }
    } else {
      const room = chatRooms.group.find((room) => room.id === chatId)
      return {
        title: room ? room.name : "",
        subtitle: `그룹 채팅 · ${room ? room.members : 0}명`,
      }
    }
  }

  const { title, subtitle } = getChatInfo()

  // 메시지 전송 처리
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    sendMessage(chatId, type, newMessage)
    setNewMessage("")
  }

  // 채팅이 업데이트될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 현재 채팅방의 메시지 가져오기
  const currentMessages = type && chatId ? messages[type][chatId] || [] : []

  // 메시지 시간 포맷팅
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/")
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) {
    return null
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 헤더 */}
            <div className="p-4 border-b flex items-center bg-gray-50">
              <button onClick={() => navigate("/chats")} className="mr-3 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-bold text-lg">{title}</h1>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 bg-gray-50">
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  메시지가 없습니다. 첫 메시지를 보내보세요!
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((message) => {
                    const isMine = message.senderId === user?.id
                    return (
                      <div key={message.id} className="w-full flex flex-col">
                        <div className={`flex items-start ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                              {type === "direct" ? chatRooms.direct.find((r) => r.id === chatId)?.userAvatar : "멤버"}
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              isMine ? "bg-blue-500 text-white rounded-tr-none" : "bg-white border rounded-tl-none"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 text-right ${isMine ? "text-blue-100" : "text-gray-500"}`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* 메시지 입력 */}
            <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
              >
                전송
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ChatRoom
