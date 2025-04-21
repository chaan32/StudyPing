"use client"

import { createContext, useState, useContext } from "react"
import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom"

// 더미 메시지 데이터
const dummyMessages = {
  // 1:1 채팅
  direct: {
    1: [
      { id: 1, senderId: 2, text: "안녕하세요! 스터디에 관심 있으신가요?", timestamp: "2024-04-21T10:30:00" },
      { id: 2, senderId: 1, text: "네, 알고리즘 스터디에 대해 더 알고 싶어요.", timestamp: "2024-04-21T10:31:00" },
      { id: 3, senderId: 2, text: "어떤 점이 궁금하신가요?", timestamp: "2024-04-21T10:32:00" },
    ],
    2: [
      { id: 1, senderId: 3, text: "토익 스터디 문의드립니다.", timestamp: "2024-04-21T11:30:00" },
      { id: 2, senderId: 1, text: "네, 어떤 점이 궁금하신가요?", timestamp: "2024-04-21T11:31:00" },
    ],
  },
  // 그룹 채팅
  group: {
    1: [
      { id: 1, senderId: 2, text: "오늘 스터디 시작 시간 8시 맞나요?", timestamp: "2024-04-21T15:30:00" },
      { id: 2, senderId: 3, text: "네, 맞습니다!", timestamp: "2024-04-21T15:31:00" },
      { id: 3, senderId: 1, text: "저도 8시에 참여하겠습니다.", timestamp: "2024-04-21T15:32:00" },
    ],
    2: [
      { id: 1, senderId: 4, text: "토익 문제 공유드립니다.", timestamp: "2024-04-21T16:30:00" },
      { id: 2, senderId: 1, text: "감사합니다!", timestamp: "2024-04-21T16:31:00" },
    ],
  },
}

// 더미 채팅방 데이터
const dummyChatRooms = {
  direct: [
    {
      id: 1,
      userId: 2,
      userName: "김코딩",
      userAvatar: "KC",
      lastMessage: "어떤 점이 궁금하신가요?",
      timestamp: "2024-04-21T10:32:00",
      unread: 0,
    },
    {
      id: 2,
      userId: 3,
      userName: "이토익",
      userAvatar: "LT",
      lastMessage: "네, 어떤 점이 궁금하신가요?",
      timestamp: "2024-04-21T11:31:00",
      unread: 1,
    },
  ],
  group: [
    {
      id: 1,
      name: "알고리즘 스터디",
      members: 6,
      lastMessage: "저도 8시에 참여하겠습니다.",
      timestamp: "2024-04-21T15:32:00",
      unread: 0,
    },
    {
      id: 2,
      name: "토익 900점 목표 스터디",
      members: 5,
      lastMessage: "감사합니다!",
      timestamp: "2024-04-21T16:31:00",
      unread: 2,
    },
  ],
}

// Context 생성
const ChatContext = createContext(null)

// Context Provider 컴포넌트
export function ChatProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState(dummyMessages)
  const [chatRooms, setChatRooms] = useState(dummyChatRooms)

  // 메시지 전송 함수
  const sendMessage = (chatId, chatType, text) => {
    if (!isLoggedIn || !user) return

    const newMessage = {
      id: messages[chatType][chatId] ? messages[chatType][chatId].length + 1 : 1,
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [chatType]: {
        ...prev[chatType],
        [chatId]: prev[chatType][chatId] ? [...prev[chatType][chatId], newMessage] : [newMessage],
      },
    }))

    // 채팅방 목록 업데이트
    updateChatRoomLastMessage(chatId, chatType, text)
  }

  // 채팅방 마지막 메시지 업데이트
  const updateChatRoomLastMessage = (chatId, chatType, text) => {
    setChatRooms((prev) => {
      const updatedRooms = prev[chatType].map((room) => {
        if (room.id === chatId) {
          return {
            ...room,
            lastMessage: text,
            timestamp: new Date().toISOString(),
            unread: 0, // 내가 보낸 메시지이므로 읽음 처리
          }
        }
        return room
      })
      return { ...prev, [chatType]: updatedRooms }
    })
  }

  // 채팅방 열기 (페이지로 이동)
  const openChat = (chatId, chatType) => {
    navigate(`/chat/${chatType}/${chatId}`)
  }

  // 새 1:1 채팅방 생성
  const createDirectChat = (userId, userName, userAvatar) => {
    // 이미 존재하는 채팅방인지 확인
    const existingRoom = chatRooms.direct.find((room) => room.userId === userId)

    if (existingRoom) {
      navigate(`/chat/direct/${existingRoom.id}`)
      return existingRoom.id
    }

    // 새 채팅방 ID 생성
    const newChatId = chatRooms.direct.length + 1

    // 채팅방 목록에 추가
    setChatRooms((prev) => ({
      ...prev,
      direct: [
        ...prev.direct,
        {
          id: newChatId,
          userId,
          userName,
          userAvatar,
          lastMessage: "",
          timestamp: new Date().toISOString(),
          unread: 0,
        },
      ],
    }))

    // 메시지 배열 초기화
    setMessages((prev) => ({
      ...prev,
      direct: {
        ...prev.direct,
        [newChatId]: [],
      },
    }))

    navigate(`/chat/direct/${newChatId}`)
    return newChatId
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        chatRooms,
        sendMessage,
        openChat,
        createDirectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

// 커스텀 훅
export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
