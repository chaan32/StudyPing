"use client"

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Client, IMessage, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ScrollArea } from "@/components/ui/scroll-area";

// 메시지 타입 정의 (백엔드와 일치 필요)
interface ChatMessage {
  // WebSocket은 senderId 제공, History는 senderEmail 제공 가정
  senderId?: number;       // WebSocket 메시지용 (Optional)
  senderEmail?: string;    // History API 메시지용 (Optional)
  senderName: string;
  content: string;
  timestamp?: string;      // Optional: ISO 8601 형식 또는 원하는 형식
}

// 스터디 정보 타입 (필요한 부분만 유지)
interface Study {
  id: number;
  title: string;
  // isJoined: boolean; // 웹소켓 연결 및 라우팅으로 대체 가능
}

export default function StudyChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const actualParams = use(params);
  const studyId = Number(actualParams.id);

  const { user, token, isLoading: isAuthLoading } = useAuth();
  const [study, setStudy] = useState<Study | null>(null); // 스터디 제목 등 표시용
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // 스크롤 제어용
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // 히스토리 로딩 상태 추가

  // 스터디 기본 정보 로딩 (채팅방 제목 등에 사용)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        router.push('/login'); // 토큰 없으면 로그인 페이지로
        return;
    }
    // 기존 스터디 정보 로딩 로직 유지 (API 경로 확인 필요)
    axios.get(`/api/study/find/id/${studyId}`, { // API 프록시 사용 확인
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((response: AxiosResponse<{ study: Study }>) => {
        setStudy(response.data.study);
        // 여기서 isJoined 체크는 불필요, 라우팅 및 웹소켓 연결로 접근 제어
    })
    .catch(error => {
        console.error("스터디 정보 로딩 실패:", error);
        // 오류 처리 (예: 스터디 목록으로 리디렉션)
        router.push('/studies');
    });
  }, [studyId, router]);

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    // Wait until we have the user and token
    if (isAuthLoading) {
        console.log("Chat: Waiting for AuthProvider to load...");
        return;
    }

    if (!user || !token || !studyId) {
      console.log("1️⃣ User Id : ", user?.id);
      console.log("2️⃣ Token : ", token);
      console.log("3️⃣ Study Id : ", studyId);
      // Optional: Redirect or show error if authentication is required but missing
      return;
    }

    console.log("Chat: Auth loaded, User and Token found, attempting connection with token:", token); // Log the token

    const socketFactory = () => new SockJS(`http://localhost:8080/connect`); // 백엔드 WebSocket 엔드포인트 (/connect)

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame: IFrame) => {
        console.log('STOMP 연결 성공:', frame);
        setIsConnected(true);

        // 해당 스터디 채팅방 구독
        client.subscribe(`/topic/chat/study/${studyId}`, (message: IMessage) => {
          try {
            const receivedMessage: ChatMessage = JSON.parse(message.body);
            console.log('메시지 수신:', receivedMessage);

            // --- 중복 방지: 내가 보낸 메시지는 무시 ---
            if (Number(receivedMessage.senderId) === Number(user?.id)) {
              return;
            }

            // 모든 수신 메시지를 상태에 추가 (중복 제거 로직 제거됨)
            setMessages((prevMessages: ChatMessage[]) => [...prevMessages, receivedMessage]);

          } catch (error) {
            console.error("메시지 처리 중 오류 발생:", error, message.body);
          }
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP 오류:', frame.headers['message']);
        console.error('오류 상세:', frame.body);
        setIsConnected(false);
        // 추가적인 오류 처리 로직 (예: 사용자에게 알림)
      },
      onWebSocketError: (event: Event) => {
        console.error('WebSocket 오류:', event);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket 연결 닫힘');
        setIsConnected(false);
      }
    });

    stompClientRef.current = client;
    client.activate();
    console.log('STOMP 클라이언트 활성화 시도'); // 1️⃣

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log('STOMP 연결 해제 시도');
      stompClientRef.current?.deactivate();
      setIsConnected(false);
      console.log('STOMP 연결 해제됨');
    };
  }, [studyId, user, token, isAuthLoading]); // studyId나 user가 변경되면 재연결

  // --- 추가된 useEffect: 채팅 기록 로드 및 읽음 처리 ---
  useEffect(() => {
    if (!studyId || !token || isAuthLoading || !user?.id) {
      console.log("History/Read: Waiting for studyId, token, auth, or user id.");
      return; // 필요한 정보가 없으면 실행 중지
    }

    const fetchHistoryAndMarkRead = async () => {
      setIsLoadingHistory(true);
      try {
        // 1. 이전 메시지 조회
        console.log(`Fetching history for room: ${studyId}`);
        console.log("Using token for history API:", token);
        const historyResponse = await axios.get<{ histories: any[] }>(`/api/chat/history/${studyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 백엔드 DTO (senderId, senderName, content) -> 프론트엔드 ChatMessage 매핑
        const mappedHistories: ChatMessage[] = historyResponse.data.histories.map(dto => ({
          senderId: dto.senderId, // senderEmail 대신 senderId 사용 (백엔드 확인 필요)
          senderName: dto.senderName,
          content: dto.content,
          // timestamp: dto.timestamp
        }));

        console.log("History loaded:", mappedHistories);
        // 이전 메시지를 현재 메시지 목록 앞에 추가
        setMessages(prevMessages => [...mappedHistories, ...prevMessages]);

        // 2. 읽음 처리 요청
        console.log(`Marking messages as read for room: ${studyId}`);
        console.log("Using token for read API:", token);
        await axios.post(`/api/chat/read/${studyId}`, {}, { // POST 요청이지만 body는 비워둠
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Messages marked as read.");

      } catch (error) {
        console.error("Error fetching history or marking read:", error);
        // TODO: 사용자에게 오류 알림 표시
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryAndMarkRead();

  }, [studyId, token, isAuthLoading, user?.id]);
  // --- useEffect 종료 ---

  // 메시지 전송 핸들러
  const sendMessage = () => {
    if (newMessage.trim() && stompClientRef.current?.connected && user && studyId) {
      // 1. Optimistic UI를 위한 메시지 객체 생성
      const optimisticMessage: ChatMessage = {
        senderId: Number(user.id),
        senderName: user.name,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(), // 임시 타임스탬프
      };

      // 2. 화면에 즉시 반영 (Optimistic Update)
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      // 3. 입력 필드 비우기
      setNewMessage("");

      // 4. 서버로 전송할 메시지 준비 (백엔드 DTO 구조에 맞게)
      const messageToSend = {
        senderId: Number(user.id),
        senderName: user.name,
        content: optimisticMessage.content, // trim된 내용 사용
        // roomId는 서버의 @DestinationVariable 또는 @MessageMapping 에서 처리
      };

      try {
          // 5. 서버로 메시지 전송 (STOMP publish)
          stompClientRef.current.publish({
            destination: `/publish/${studyId}`,
            body: JSON.stringify(messageToSend),
          });
          console.log('메시지 발송 (서버로):', messageToSend);

      } catch (error) {
          console.error("메시지 발송 실패:", error);
          // TODO: 실패 시 Optimistic 업데이트 롤백 처리 (예: 임시 메시지 제거)
          // 예: setMessages(prev => prev.filter(msg => msg.timestamp !== optimisticMessage.timestamp));
      }
    } else {
      console.warn("메시지 발송 불가 - 연결 상태 확인 또는 메시지 입력 필요", {
        connected: stompClientRef.current?.connected,
        newMessage: newMessage.trim(),
        user, studyId
      });
      // 사용자에게 알림 (예: '연결 중이거나 메시지를 입력하세요')
    }
  };

   // 새 메시지 수신 시 스크롤 맨 아래로 이동
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div'); // ScrollArea 내부의 div 찾기
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // 로딩 상태 또는 스터디 정보 없을 때 UI
  if (!study) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>스터디 정보를 불러오는 중...</p>
        {/* 또는 스켈레톤 UI */} 
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4 bg-red-100">
      <h1 className="text-2xl font-bold mb-4">{study.title} - 채팅</h1>
      <p className="mb-2 text-sm text-gray-600">
        연결 상태: {isConnected ? <span className="text-green-600 font-semibold">연결됨</span> : <span className="text-red-600 font-semibold">연결 끊김</span>}
      </p>
      <ScrollArea className="flex-grow border rounded-md p-4 mb-4 bg-gray-50" ref={scrollAreaRef}>
        {isLoadingHistory && <p className="text-center text-gray-500">이전 대화 기록을 불러오는 중...</p>}
        {messages.map((msg: ChatMessage, index: number) => {
          // 현재 사용자의 메시지인지 판단 (senderId 기준으로 통일)
          // 타입을 숫자로 통일하여 비교
          const isCurrentUser = Number(msg.senderId) === Number(user?.id);

          return (
          <div key={index} className={`flex items-start gap-3 mb-3 ${isCurrentUser ? 'justify-end' : ''}`}>
            {!isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.senderName ? msg.senderName.slice(0, 1).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className={`p-3 rounded-lg max-w-[70%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {!isCurrentUser && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
              <p className="text-sm">{msg.content}</p>
              {/* timestamp 표시 (옵션) */}
              {msg.timestamp && <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>}
            </div>
            {/* 현재 유저 아바타 (오른쪽, 옵션) */}
            {/* {isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name ? user.name.slice(0, 1).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            )} */}
          </div>
          );
        })}
      </ScrollArea>

      {/* Message Input and Send Button Area - Separated */}
      <div className="p-2 border-t bg-white flex-shrink-0"> 
        <Input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          className="w-full mb-2" // Full width and margin bottom
          disabled={!isConnected}
        />
        <div className="flex justify-end"> {/* Align button to the right */}
          <Button 
            onClick={sendMessage} 
            disabled={!isConnected || newMessage.trim().length === 0}
          >
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}
