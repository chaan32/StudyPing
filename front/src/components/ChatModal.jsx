"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"

function ChatModal() {
  const { user } = useAuth()
  const { messages, activeChatId, activeChatType, sendMessage, closeChat, chatRooms } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // 채팅 상대 정보 가져오기
  const getChatInfo = () => {
    if (!activeChatId || !activeChatType) return { title: "", subtitle: "" }

    if (activeChatType === "direct") {
      const room = chatRooms.direct.find((room) => room.id === activeChatId)
      return {
        title: room ? room.userName : "",
        subtitle: "1:1 채팅",
      }
    } else {
      const room = chatRooms.group.find((room) => room.id === activeChatId)
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

    sendMessage(activeChatId, activeChatType, newMessage)
    setNewMessage("")
  }

  // 채팅이 업데이트될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeChatId])

  // 현재 활성화된 채팅방의 메시지 가져오기
  const currentMessages = activeChatId && activeChatType ? messages[activeChatType][activeChatId] || [] : []

  // 메시지 시간 포맷팅
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-[500px] flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <button onClick={closeChat} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {currentMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              메시지가 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === user?.id
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${message.senderId === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 메시지 입력 */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
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
  )
}

export default ChatModal
