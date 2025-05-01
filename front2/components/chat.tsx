"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, PaperclipIcon, Smile } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

// 메시지 타입 정의
interface Message {
  id: string
  sender: {
    id: number
    name: string
    avatar: string
  }
  content: string
  timestamp: Date
  isMe: boolean
}

// 더미 사용자들
const dummyUsers = [
  {
    id: 1,
    name: "김코딩",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "이알고",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "박자바",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function ChatComponent({ studyId, studyTitle }: { studyId: number; studyTitle?: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 웹소켓 연결 (실제로는 백엔드 서버 URL로 연결)
  useEffect(() => {
    // 실제 구현에서는 실제 WebSocket 서버에 연결합니다
    // const ws = new WebSocket(`wss://your-backend.com/ws/chat/${studyId}`);

    // 백엔드 연결 전 시뮬레이션
    console.log(`WebSocket 연결 시도 (스터디 ID: ${studyId})`)

    // 연결 상태 업데이트
    setConnected(true)

    // 초기 메시지 로드 (더미 데이터)
    const initialMessages: Message[] = [
      {
        id: "1",
        sender: dummyUsers[0],
        content: "안녕하세요! 이번 주 스터디 주제는 그래프 알고리즘입니다.",
        timestamp: new Date(Date.now() - 3600000 * 2),
        isMe: false,
      },
      {
        id: "2",
        sender: dummyUsers[1],
        content: "네, 준비하고 있습니다. BFS와 DFS 관련 문제를 풀어보고 있어요.",
        timestamp: new Date(Date.now() - 3600000),
        isMe: false,
      },
      {
        id: "3",
        sender: dummyUsers[2],
        content: "저는 다익스트라 알고리즘을 공부하고 있습니다. 혹시 추천하는 문제 있으신가요?",
        timestamp: new Date(Date.now() - 1800000),
        isMe: false,
      },
      {
        id: "4",
        sender: { id: 999, name: user?.name || "나", avatar: user?.avatar || "/placeholder.svg?height=40&width=40" },
        content: "안녕하세요! 방금 참여했습니다. 이번 주 스터디 시간이 언제인가요?",
        timestamp: new Date(Date.now() - 300000),
        isMe: true,
      },
      {
        id: "5",
        sender: dummyUsers[0],
        content: "토요일 오후 2시입니다! 환영합니다 :)",
        timestamp: new Date(Date.now() - 60000),
        isMe: false,
      },
    ]

    setMessages(initialMessages)

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log("WebSocket 연결 해제")
      if (socket) {
        socket.close()
      }
      setConnected(false)
    }
  }, [studyId, user])

  // 새 메시지 수신 시 스크롤 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 메시지 전송 핸들러
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    // 실제 구현에서는 WebSocket을 통해 메시지를 전송합니다
    // socket?.send(JSON.stringify({ content: newMessage }));

    // 백엔드 연결 전 시뮬레이션
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: {
        id: 999,
        name: user?.name || "나",
        avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
      },
      content: newMessage,
      timestamp: new Date(),
      isMe: true,
    }

    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")

    // 가짜 응답 시뮬레이션 (랜덤 사용자가 응답)
    setTimeout(
      () => {
        const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)]
        const responses = [
          "네, 알겠습니다!",
          "좋은 의견이네요.",
          "저도 그렇게 생각합니다.",
          "더 자세히 설명해주실 수 있나요?",
          "다음 스터디에서 논의해보면 좋을 것 같아요.",
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const responseMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: randomUser,
          content: randomResponse,
          timestamp: new Date(),
          isMe: false,
        }

        setMessages((prev) => [...prev, responseMsg])
      },
      1000 + Math.random() * 2000,
    )
  }

  // 날짜 포맷 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // 날짜 그룹화 (같은 날짜의 메시지는 하나의 그룹으로)
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach((message) => {
      const messageDate = message.timestamp.toLocaleDateString()
      const existingGroup = groups.find((group) => group.date === messageDate)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        })
      }
    })

    return groups
  }

  return (
    <div className="flex flex-col h-full">
      {/* 채팅방 헤더 */}
      {studyTitle && (
        <div className="py-3 px-4 border-b flex items-center justify-between bg-muted/30">
          <h3 className="font-medium">{studyTitle} 채팅방</h3>
          <div className="text-sm text-muted-foreground">{connected ? "연결됨" : "연결 중..."}</div>
        </div>
      )}

      {!connected ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">채팅 서버에 연결 중...</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {groupMessagesByDate().map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {new Date(group.date).toLocaleDateString()}
                  </span>
                </div>

                {group.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${message.isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                        <AvatarFallback>{message.sender.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className={`space-y-1 ${message.isMe ? "items-end" : "items-start"}`}>
                        {!message.isMe && <div className="text-sm font-medium">{message.sender.name}</div>}
                        <div className="flex items-end gap-2">
                          {!message.isMe && (
                            <div className="text-xs text-gray-500">{formatTime(message.timestamp)}</div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.isMe && <div className="text-xs text-gray-500">{formatTime(message.timestamp)}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
                <PaperclipIcon className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
              />
              <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
