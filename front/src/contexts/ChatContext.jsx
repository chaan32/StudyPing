"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Context 생성
const ChatContext = createContext(null)

// Context Provider 컴포넌트
export function ChatProvider({ children }) {
  const { user, isLoggedIn, token } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState({ direct: {}, group: {} })
  const [chatRooms, setChatRooms] = useState({ direct: [], group: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API 요청을 위한 공통 설정 (헤더, 인증 등)
  const getApiConfig = useCallback(() => {
    const config = {
      headers: {}
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log("인증 토큰 설정됨:", `Bearer ${token.substring(0, 15)}...`)
    } else {
      console.warn("인증 토큰이 없습니다!")
    }
    
    return config
  }, [token])

  // 채팅방 목록 가져오기
  const fetchChatRooms = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.warn("로그인이 필요한 서비스입니다.")
        return;
      }

      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`/chat/find/joined/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      
      console.log("채팅방 목록 응답:", response.data)

      if (response.data.chatRoomList) {
        // 직접 채팅 및 그룹 채팅 나누기
        const direct = [];
        const group = [];

        response.data.chatRoomList.forEach(room => {
          const chatRoom = {
            id: room.roomId,
            name: room.roomName,
            userName: room.roomName,  // 직접 채팅에서는 상대방 이름으로 사용
            lastMessage: room.lastMessage || "",
            lastMessageTime: room.lastMessageTime || new Date(),
            unreadCount: room.unreadCount || 0
          };

          if (room.roomType === "DIRECT") {
            direct.push(chatRoom);
          } else if (room.roomType === "GROUP") {
            group.push({
              ...chatRoom,
              members: room.memberCount || 2  // 멤버 수 정보가 있으면 사용, 없으면 기본값 2
            });
          }
        });

        setChatRooms({
          direct,
          group
        });

        console.log("채팅방 목록 처리 완료:", { direct, group });
      } else {
        console.warn("채팅방 목록을 찾을 수 없습니다.");
        setChatRooms({ direct: [], group: [] });
      }
    } catch (error) {
      console.error("채팅방 목록 가져오기 실패:", error);
      setChatRooms({ direct: [], group: [] });
    } finally {
      setLoading(false);
    }
  }, [user, getApiConfig])

  // 채팅 기록 가져오기
  const fetchChatHistory = async (roomId, chatType) => {
    if (!isLoggedIn || !user || !roomId) {
      console.warn("fetchChatHistory: 로그인 상태가 아니거나 사용자 정보 또는 roomId가 없습니다")
      return Promise.resolve()
    }
    
    try {
      console.log(`채팅 기록 API 요청: /chat/history/${roomId}`)
      
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`/chat/history/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      
      console.log("채팅 기록 API 응답:", response.data)
      
      if (response.data && response.data.data) {
        const chatHistory = response.data.data.map(msg => ({
          id: msg.id || Date.now(),
          senderId: msg.senderId,
          senderName: msg.senderName,
          text: msg.message,
          timestamp: msg.timestamp || new Date().toISOString(),
        }))
        
        console.log(`${roomId} 채팅방 메시지 수:`, chatHistory.length)
        
        setMessages(prev => ({
          ...prev,
          [chatType]: {
            ...prev[chatType],
            [roomId]: chatHistory
          }
        }))
        
        // 읽음 상태 업데이트 (옵션)
        if (chatHistory.length > 0) {
          console.log(`읽음 상태 업데이트 요청: /chat/read/${roomId}`)
          try {
            const readResponse = await axios.post(`/chat/read/${roomId}`, {
              memberId: user.id
            }, getApiConfig())
            console.log("읽음 상태 업데이트 응답:", readResponse.data)
          } catch (err) {
            console.error('읽음 상태 업데이트 실패:', err)
          }
        }
      } else {
        console.warn("채팅 기록 API 응답에 데이터가 없습니다:", response.data)
      }
    } catch (error) {
      console.error(`채팅 기록(${roomId})을 가져오는 중 오류 발생:`, error)
      console.error('오류 응답:', error.response?.data)
      console.error('오류 상태:', error.response?.status)
    }
    
    return Promise.resolve() // 항상 Promise를 반환하여 finally 사용 가능
  }

  // 로그인 상태가 변경되면 채팅방 목록 가져오기
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log("로그인 상태 변경: 채팅방 목록 자동 로드")
      fetchChatRooms()
    }
  }, [isLoggedIn, user, fetchChatRooms])

  // 메시지 전송 함수 (STOMP 클라이언트에서 처리되므로 여기서는 필요 없음)
  const sendMessage = (chatId, chatType, text) => {
    // 이 함수는 기본 틀만 남겨두고, 실제 메시지 전송은 ChatRoom.jsx에서 처리
    console.log(`메시지 전송: ${chatId}, ${chatType}, ${text}`)
  }

  // 채팅방 마지막 메시지 업데이트 (웹소켓으로 받은 메시지 기반으로 UI 업데이트에 사용)
  const updateChatRoomLastMessage = (chatId, chatType, text, timestamp) => {
    setChatRooms((prev) => {
      const updatedRooms = prev[chatType].map((room) => {
        if (room.id === chatId) {
          return {
            ...room,
            lastMessage: text,
            lastMessageTime: timestamp || new Date().toISOString(),
            unreadCount: room.unreadCount + 1, // 새 메시지 알림 증가
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
  const createDirectChat = async (userId) => {
    if (!isLoggedIn || !user) {
      console.warn("createDirectChat: 로그인 상태가 아니거나 사용자 정보가 없습니다")
      return null
    }
    
    try {
      // 이미 존재하는 채팅방인지 확인
      const existingRoom = chatRooms.direct.find((room) => room.userId === userId)

      if (existingRoom) {
        console.log("기존 채팅방으로 이동:", existingRoom.id)
        navigate(`/chat/direct/${existingRoom.id}`)
        return existingRoom.id
      }
      
      // 새 1:1 채팅방 생성 API 호출
      console.log(`1:1 채팅방 생성 API 요청: /chat/direct/${userId}`)
      const response = await axios.post(`/chat/direct/${userId}`, {}, getApiConfig())
      console.log("1:1 채팅방 생성 API 응답:", response.data)
      
      if (response.data && response.data.data) {
        const newRoom = response.data.data
        console.log("새로운 채팅방 ID:", newRoom.roomId)
        
        // 채팅방 목록 업데이트
        setChatRooms(prev => ({
          ...prev,
          direct: [
            ...prev.direct,
            {
              id: newRoom.roomId,
              userId: userId,
              userName: newRoom.participantName || '상대방',
              userAvatar: newRoom.participantName ? newRoom.participantName.charAt(0) : '?',
              lastMessage: '',
              timestamp: new Date().toISOString(),
              unread: 0,
            }
          ]
        }))
        
        // 메시지 배열 초기화
        setMessages(prev => ({
          ...prev,
          direct: {
            ...prev.direct,
            [newRoom.roomId]: []
          }
        }))
        
        navigate(`/chat/direct/${newRoom.roomId}`)
        return newRoom.roomId
      } else {
        console.warn("1:1 채팅방 생성 API 응답에 데이터가 없습니다:", response.data)
      }
    } catch (error) {
      console.error('1:1 채팅방 생성 중 오류 발생:', error)
      console.error('오류 응답:', error.response?.data)
      console.error('오류 상태:', error.response?.status)
      return null
    }
  }

  // API 엔드포인트 목록 확인 (테스트용)
  const testApiEndpoints = async () => {
    console.log("=== API 엔드포인트 테스트 시작 ===")
    try {
      if (user && user.id) {
        // 참여 채팅방 API 테스트
        console.log("참여 채팅방 API 테스트...")
        await axios.get(`/chat/find/joined/${user.id}`, getApiConfig())
          .then(res => console.log("성공: /chat/find/joined/:id"))
          .catch(err => console.error("실패: /chat/find/joined/:id -", err.message))
          
        // 채팅 기록 API 테스트 (임의의 방 ID로)
        console.log("채팅 기록 API 테스트...")
        await axios.get(`/chat/history/1`, getApiConfig())
          .then(res => console.log("성공: /chat/history/:roomId"))
          .catch(err => console.error("실패: /chat/history/:roomId -", err.message))
      } else {
        console.error("API 테스트를 위한 사용자 정보가 없습니다.")
      }
    } catch (error) {
      console.error("API 테스트 중 오류 발생:", error)
    }
    console.log("=== API 엔드포인트 테스트 종료 ===")
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        chatRooms,
        sendMessage,
        openChat,
        createDirectChat,
        fetchChatRooms,
        fetchChatHistory,
        updateChatRoomLastMessage,
        loading,
        error,
        testApiEndpoints
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
