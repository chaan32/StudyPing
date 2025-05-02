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
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string; // ISO 8601 형식 또는 원하는 형식
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

  const { user } = useAuth();
  const [study, setStudy] = useState<Study | null>(null); // 스터디 제목 등 표시용
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // 스크롤 제어용

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
    if (!studyId || !user) return; // studyId와 user 정보가 있어야 연결 시도

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("인증 토큰 없음");
      router.push('/login');
      return;
    }

    // SockJS 인스턴스 생성
    const socketFactory = () => new SockJS(`http://localhost:8080/connect`); // 백엔드 WebSocket 엔드포인트 (/connect)

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`, // 백엔드 StompHandler에서 처리하는 헤더
      },
      reconnectDelay: 5000, // 5초 후 재연결 시도
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
    console.log('STOMP 클라이언트 활성화 시도');

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log('STOMP 연결 해제 시도');
      stompClientRef.current?.deactivate();
      setIsConnected(false);
      console.log('STOMP 연결 해제됨');
    };
  }, [studyId, user, router]); // studyId나 user가 변경되면 재연결

  // 메시지 전송 핸들러
  const sendMessage = () => {
    if (newMessage.trim() && stompClientRef.current?.connected && user && studyId) {
      const chatMessage: Omit<ChatMessage, 'timestamp'> = { // timestamp는 서버에서 설정 가정
        senderId: Number(user.id),
        senderName: user.name,
        content: newMessage.trim(),
      };
      try {
          stompClientRef.current.publish({
            destination: `/publish/chat/study/${studyId}`, // 메시지 발행 엔드포인트 (/publish)
            body: JSON.stringify(chatMessage),
            // headers: { 'priority': '9' } // 필요한 경우 헤더 추가
          });
          console.log('메시지 발송:', chatMessage);
          setNewMessage("");
      } catch (error) {
          console.error("메시지 발송 실패:", error);
          // 사용자에게 오류 알림
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
    <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{study.title} - 채팅</h1>
      <p className="mb-2 text-sm text-gray-600">
        연결 상태: {isConnected ? <span className="text-green-600 font-semibold">연결됨</span> : <span className="text-red-600 font-semibold">연결 끊김</span>}
      </p>
      <ScrollArea className="flex-grow border rounded-md p-4 mb-4 bg-gray-50" ref={scrollAreaRef}>
        {messages.map((msg: ChatMessage, index: number) => (
          <div key={index} className={`flex items-start gap-3 mb-3 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
            {msg.senderId !== user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.senderName ? msg.senderName.slice(0, 1).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.senderId !== user?.id && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {msg.senderId === user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name ? user.name.slice(0, 1).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
          disabled={!isConnected} // 연결 안 됐으면 비활성화
        />
        <Button onClick={sendMessage} disabled={!isConnected || !newMessage.trim()}>전송</Button>
      </div>
    </div>
  );
}
