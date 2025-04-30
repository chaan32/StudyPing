"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { ArrowLeft } from "../components/icons/Icons"
import SockJS from "sockjs-client"
import Stomp from "stompjs"

function ChatRoom() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { user, isLoggedIn, token } = useAuth()
  const { messages, setMessages, fetchChatHistory, updateChatRoomLastMessage, chatRooms } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)
  const [stompClient, setStompClient] = useState(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connectError, setConnectError] = useState(null)

  // 채팅방 ID를 숫자로 변환
  const chatId = Number.parseInt(id, 10)

  // 채팅 기록 가져오기
  useEffect(() => {
    if (isLoggedIn && user && chatId) {
      setLoading(true)
      fetchChatHistory(chatId, type)
        .finally(() => setLoading(false))
    }
  }, [isLoggedIn, user, chatId, type, fetchChatHistory])

  // WebSocket 연결 설정
  useEffect(() => {
    // localStorage에서 직접 토큰 확인
    const localStorageToken = localStorage.getItem('accessToken');
    // context token이나 localStorage token 중 하나 사용
    const effectiveToken = token || localStorageToken;
    
    // 디버깅을 위한 상태 출력
    console.log("WebSocket 연결 디버깅 정보:", {
      isLoggedIn,
      chatId,
      contextToken: !!token,
      localStorageToken: !!localStorageToken,
      effectiveToken: !!effectiveToken,
      user
    });

    if (!isLoggedIn) {
      console.warn("WebSocket 연결 실패: 로그인 상태가 아닙니다.");
      return;
    }
    
    if (!chatId) {
      console.warn("WebSocket 연결 실패: 채팅방 ID가 없습니다.");
      return;
    }
    
    if (!effectiveToken) {
      console.warn("WebSocket 연결 실패: 인증 토큰이 없습니다.");
      return;
    }

    setConnectError(null);

    // 웹소켓 연결 함수
    const connectWebSocket = () => {
      try {
        console.log("WebSocket 연결 시도...");

        // SockJS와 Stomp 클라이언트 생성
        const sock = new SockJS("http://localhost:8080/connect");
        const stomp = Stomp.over(sock);
        
        // 디버그 출력 비활성화 (선택적)
        stomp.debug = null; 
        
        // 연결 시도
        stomp.connect(
          // 헤더에 토큰 추가
          { 'Authorization': `Bearer ${effectiveToken}` },
          
          // 연결 성공 시 콜백
          () => {
            console.log("STOMP 연결 성공");
            setConnected(true);
            setConnectError(null);
            setStompClient(stomp);
            
            // 채팅방 구독
            stomp.subscribe(
              `/topic/${chatId}`,
              (message) => {
                // 메시지 수신 시 처리
                if (message.body) {
                  try {
                    const receivedMsg = JSON.parse(message.body);
                    console.log("메시지 수신:", receivedMsg);
                    
                    // 수신된 메시지가 내가 보낸 것이 아닌 경우에만 읽지 않음 카운트 증가
                    if (receivedMsg.senderId !== user?.id) {
                      updateChatRoomLastMessage(
                        chatId, 
                        type, 
                        receivedMsg.message,
                        receivedMsg.timestamp
                      );
                    }
                    
                    // useChat 컨텍스트의 메시지 상태 업데이트
                    setMessages(prevMessages => {
                      const typeMessages = {...prevMessages[type] || {}};
                      const roomMessages = [...(typeMessages[chatId] || [])];
                      
                      // 중복 메시지 방지를 위한 체크
                      if (!roomMessages.some(msg => 
                        msg.id === receivedMsg.id || 
                        (msg.text === receivedMsg.message && msg.senderId === receivedMsg.senderId)
                      )) {
                        roomMessages.push({
                          id: receivedMsg.id || Date.now(),
                          text: receivedMsg.message,
                          senderId: receivedMsg.senderId,
                          senderName: receivedMsg.senderName,
                          timestamp: receivedMsg.timestamp || new Date().toISOString(),
                        });
                      }
                      
                      return {
                        ...prevMessages,
                        [type]: {
                          ...typeMessages,
                          [chatId]: roomMessages
                        }
                      };
                    });
                  } catch (error) {
                    console.error("메시지 처리 중 오류:", error);
                  }
                }
              },
              // 구독 시 헤더에 토큰 추가
              { 'Authorization': `Bearer ${effectiveToken}` }
            );
            
            console.log(`채팅방 ${chatId} 구독 성공`);
          },
          
          // 오류 발생 시 콜백
          (error) => {
            console.error("STOMP 연결 실패:", error);
            setConnected(false);
            setConnectError(`연결 실패: ${error}`);
          }
        );
        
        return stomp;
      } catch (error) {
        console.error("WebSocket 연결 중 오류 발생:", error);
        setConnected(false);
        setConnectError("웹소켓 연결에 실패했습니다");
        return null;
      }
    };

    // 초기 연결 시도
    const client = connectWebSocket();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (client && client.connected) {
        console.log("컴포넌트 언마운트: WebSocket 연결 종료");
        client.disconnect(() => {
          console.log("STOMP 연결 해제 완료");
        }, { 'Authorization': `Bearer ${effectiveToken}` });
      }
    };
  }, [isLoggedIn, chatId, type, setMessages, user, updateChatRoomLastMessage, token]);

  // 웹소켓 재연결
  const reconnectWebSocket = () => {
    const localStorageToken = localStorage.getItem('accessToken');
    const effectiveToken = token || localStorageToken;
    
    if (!effectiveToken) {
      alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
      navigate("/");
      return;
    }
    
    console.log("재연결 시도 중...");
    console.log("토큰 정보:", {
      token: effectiveToken ? effectiveToken.substring(0, 10) + "..." : "없음"
    });
    
    try {
      const sock = new SockJS("http://localhost:8080/connect");
      const stomp = Stomp.over(sock);
      
      // 디버그 출력 비활성화 (선택적)
      stomp.debug = null; 
      
      stomp.connect(
        { 'Authorization': `Bearer ${effectiveToken}` },
        () => {
          console.log("STOMP 재연결 성공");
          setConnected(true);
          setConnectError(null);
          setStompClient(stomp);
          
          stomp.subscribe(
            `/topic/${chatId}`,
            (message) => {
              if (message.body) {
                try {
                  const receivedMsg = JSON.parse(message.body);
                  console.log("메시지 수신:", receivedMsg);
                  
                  // 수신된 메시지가 내가 보낸 것이 아닌 경우에만 읽지 않음 카운트 증가
                  if (receivedMsg.senderId !== user?.id) {
                    updateChatRoomLastMessage(
                      chatId, 
                      type, 
                      receivedMsg.message,
                      receivedMsg.timestamp
                    );
                  }
                  
                  // useChat 컨텍스트의 메시지 상태 업데이트
                  setMessages(prevMessages => {
                    const typeMessages = {...prevMessages[type] || {}};
                    const roomMessages = [...(typeMessages[chatId] || [])];
                    
                    // 중복 메시지 방지를 위한 체크
                    if (!roomMessages.some(msg => 
                      msg.id === receivedMsg.id || 
                      (msg.text === receivedMsg.message && msg.senderId === receivedMsg.senderId)
                    )) {
                      roomMessages.push({
                        id: receivedMsg.id || Date.now(),
                        text: receivedMsg.message,
                        senderId: receivedMsg.senderId,
                        senderName: receivedMsg.senderName,
                        timestamp: receivedMsg.timestamp || new Date().toISOString(),
                      });
                    }
                    
                    return {
                      ...prevMessages,
                      [type]: {
                        ...typeMessages,
                        [chatId]: roomMessages
                      }
                    };
                  });
                } catch (error) {
                  console.error("메시지 처리 중 오류:", error);
                }
              }
            },
            { 'Authorization': `Bearer ${effectiveToken}` }
          );
        },
        (error) => {
          console.error("STOMP 재연결 실패:", error);
          setConnected(false);
          setConnectError(`재연결 실패: ${error}`);
        }
      );
    } catch (error) {
      console.error("WebSocket 재연결 시도 중 오류:", error);
    }
  };

  // 메시지 전송 처리
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !connected || !stompClient) return

    try {
      // 토큰 가져오기
      const effectiveToken = token || localStorage.getItem('accessToken');
      
      // 메시지 객체 생성
      const chatMessage = {
        message: newMessage,
        senderEmail: user.email,
        senderName: user.name,
        senderId: user.id
        // roomId는 서버에서 URL 경로에서 추출
      }

      console.log("메시지 전송:", chatMessage)

      // StompJS 방식으로 메시지 전송
      stompClient.send(
        `/publish/${chatId}`, 
        { 'Authorization': `Bearer ${effectiveToken}`, 'content-type': 'application/json' },
        JSON.stringify(chatMessage)
      );
      
      setNewMessage("")
    } catch (error) {
      console.error("메시지 전송 중 오류 발생:", error)
    }
  }

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

  // 채팅이 업데이트될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 현재 채팅방의 메시지 가져오기
  const currentMessages = type && chatId ? messages[type]?.[chatId] || [] : []

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
              {connected && (
                <div className="ml-auto flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-xs text-green-500">연결됨</span>
                </div>
              )}
              {!connected && (
                <div className="ml-auto flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  <span className="text-xs text-red-500">연결 끊김</span>
                  {connectError && (
                    <span className="text-xs text-red-500 ml-1">({connectError})</span>
                  )}
                </div>
              )}
            </div>

            {/* 메시지 목록 */}
            <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mr-2"></div>
                  메시지를 불러오는 중...
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  메시지가 없습니다. 첫 메시지를 보내보세요!
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((message, index) => {
                    const isMine = message.senderId === user?.id
                    return (
                      <div key={message.id || index} className="w-full flex flex-col">
                        <div className={`flex items-start ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                              {message.senderName ? message.senderName.charAt(0) : "?"}
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
                placeholder={connected ? "메시지를 입력하세요..." : "연결 대기 중..."}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={!connected}
              />
              {connected ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
                  disabled={!newMessage.trim()}
                >
                  전송
                </button>
              ) : (
                <button
                  type="button"
                  onClick={reconnectWebSocket}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-all"
                >
                  재연결
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ChatRoom
