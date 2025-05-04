'use client';

import React, { useEffect, useRef, useState, useCallback } from "react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider" 
import SockJS from "sockjs-client"
import { CompatClient, Stomp } from "@stomp/stompjs"
import { format } from "date-fns" 
import axios from 'axios'; 

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

interface DisplayMessage { 
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
}

interface ChatMessagePayload {
  message: string;
  senderId: number;
  senderName: string;
  senderEmail?: string;
}

interface ChatProps {
  studyId: number;
  client: CompatClient | null;
  isConnected: boolean;
  messages: DisplayMessage[];
}

export default function ChatComponent({ studyId, studyTitle }: { studyId: number; studyTitle?: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const stompClientRef = useRef<CompatClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); 

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) { 
      setToken(storedToken);
    }
  }, []);

  const loadChatHistory = useCallback(async () => {
    // <<< Log: Check if loadChatHistory function starts >>>
    console.log("--- loadChatHistory function started ---");

    if (!studyId || !token || isLoadingHistory) { 
      console.log("History Load: Skipping fetch (studyId/token missing or already loading)");
      return;
    }
    console.log("History Load: Attempting to fetch chat history for study:", studyId);
    setIsLoadingHistory(true); 

    // <<< Log user and token status before fetching history >>>
    console.log(`History Load Check: User available? ${!!user}, Token available? ${!!token}`);
    if (user) {
      console.log(`History Load Check: Current userId = ${user.id}`);
    }

    try {
      const response = await axios.get(`/api/chat/study/${studyId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('<<< Fetched Chat History Data: >>>', response.data);

      if (response.data && Array.isArray(response.data)) {
        const historyMessages: Message[] = response.data.map((dto: any) => { 
          const isCurrentUser = user ? dto.senderId === user.id : false;
          console.log(`History Msg Check: senderId=${dto.senderId}, userId=${user?.id}, isMe=${isCurrentUser}`);
          
          return { 
            id: dto.messageId || `${dto.senderId}-${dto.timestamp || Date.now()}`, 
            sender: {
              id: dto.senderId,
              name: dto.senderName || "Unknown User",
              avatar: dto.senderAvatar || "/placeholder.svg?height=40&width=40",
            },
            content: dto.message || dto.content, 
            timestamp: new Date(dto.timestamp || Date.now()),
            isMe: isCurrentUser, 
          };
        });
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newHistory = historyMessages.filter(h => !existingIds.has(h.id));
          const combined = [...prev, ...newHistory];
          combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          return combined;
        });
        console.log("History Load: Successfully loaded and processed history.");
      } else {
        console.warn("History Load: Received data is not an array or is empty:", response.data);
      }

    } catch (error) {
      console.error("History Load: Failed to fetch chat history:", error);
    } finally {
      setIsLoadingHistory(false); 
    }
  }, [studyId, token, user, isLoadingHistory]); 

  useEffect(() => {
    setMessages([]);
    loadChatHistory();
  }, [loadChatHistory]); 

  useEffect(() => {
    if (!studyId || !user || !token) {
      console.log("WebSocket: Missing studyId, user, or token. Skipping connection.")
      return
    }

    if (stompClientRef.current && stompClientRef.current.active) {
        console.log("WebSocket: Connection already active. Skipping new connection attempt.");
        return;
    }

    console.log("WebSocket: Attempting to connect...")

    const socket = new SockJS(`http://localhost:8080/connect`)
    const client = Stomp.over(socket)

    client.configure({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("STOMP DEBUG:", str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      // <<< Log: Check if onConnect callback starts >>>
      console.log("--- WebSocket onConnect callback started ---");
      console.log("WebSocket Connected (inside onConnect):", frame)
      setConnected(true)

      const subscription = client.subscribe(`/topic/chat/study/${studyId}`, (message) => {
        try {
          const receivedMsgDto = JSON.parse(message.body)
          console.log("WebSocket Message received:", receivedMsgDto)

          const messageId = receivedMsgDto.messageId || `${receivedMsgDto.senderId}-${receivedMsgDto.timestamp || Date.now()}`; 

          const isCurrentUser = user ? receivedMsgDto.senderId === user.id : false;
          console.log(`WebSocket Msg Check: senderId=${receivedMsgDto.senderId}, userId=${user?.id}, isMe=${isCurrentUser}`);

          const frontendMsg: Message = {
            id: messageId,
            sender: {
              id: receivedMsgDto.senderId,
              name: receivedMsgDto.senderName || "Unknown User",
              avatar: receivedMsgDto.senderAvatar || "/placeholder.svg?height=40&width=40",
            },
            content: receivedMsgDto.message, 
            timestamp: new Date(receivedMsgDto.timestamp || Date.now()),
            isMe: isCurrentUser, 
          }

          setMessages((prev) => {
            if (prev.some(msg => msg.id === frontendMsg.id)) { 
                console.log("Duplicate WebSocket message detected by ID, skipping:", frontendMsg.id);
                return prev;
            }
            const updatedMessages = [...prev, frontendMsg];
            updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            return updatedMessages;
          });
        } catch (error) {
          console.error("Failed to parse received message:", error, message.body)
        }
      })
      console.log(`Subscribed to /topic/chat/study/${studyId}`)
    }

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"])
      console.error("Additional details: " + frame.body)
      setConnected(false)
    }

    client.onWebSocketError = (error) => {
        console.error("WebSocket Error:", error);
        setConnected(false);
        stompClientRef.current = null;
    };

    client.onWebSocketClose = (event) => {
        console.log("WebSocket Closed:", event);
        setConnected(false);
        stompClientRef.current = null;
    };

    try {
        console.log("Activating STOMP client...");
        client.activate();
        stompClientRef.current = client;
    } catch (error) {
        console.error("Failed to activate STOMP client:", error);
        stompClientRef.current = null;
    }

    return () => {
      console.log("ChatComponent cleanup: Deactivating WebSocket connection for study", studyId);
      if (stompClientRef.current) {
        try {
            stompClientRef.current.deactivate();
        } catch (error) {
          console.error("Error during STOMP deactivation:", error);
        }
      } else {
        console.log("Cleanup: No STOMP client ref found.");
      }
      stompClientRef.current = null;
      setConnected(false);
    }
  }, [studyId, user, token]) 

  const sendMessage = () => {
    if (newMessage.trim() && stompClientRef.current?.connected && user && studyId) {

      const chatMessagePayload: ChatMessagePayload = {
        message: newMessage.trim(),
        senderId: Number(user.id),
        senderName: user.name,
      };

      try {
        stompClientRef.current?.publish({
          destination: `/publish/chat/study/${studyId}`, 
          body: JSON.stringify(chatMessagePayload),
        });
        console.log('Message sent:', chatMessagePayload);
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    } else {
      console.warn("Cannot send message - Check connection, input, or user state", {
        connected: stompClientRef.current?.connected,
        newMessage: newMessage.trim(),
        user,
        studyId
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme_header_height)] bg-muted/20"> 
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <h2 className="text-xl font-semibold">{studyTitle || "Chat Room"}</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </header>
      <ScrollArea className="flex-1 p-4 bg-background/90" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index} 
              className={`flex items-end gap-2 p-2 ${msg.isMe ? "justify-end" : ""}`}
            >
              {!msg.isMe && (
                <Avatar className="w-8 h-8 border">
                  <AvatarImage src={msg.sender.avatar || "/placeholder.svg?height=40&width=40"} alt={msg.sender.name} />
                  <AvatarFallback>{msg.sender.name ? msg.sender.name.slice(0, 2).toUpperCase() : '??'}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[70%] ${ 
                  msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {!msg.isMe && <p className="text-xs font-medium mb-1 text-muted-foreground">{msg.sender.name || 'Unknown User'}</p>}
                <p className="text-sm break-words">{msg.content}</p> 
                <p className={`text-xs mt-1 text-right ${msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}> 
                  {format(msg.timestamp, "HH:mm")} 
                </p>
              </div>
              {msg.isMe && user && ( 
                <Avatar className="w-8 h-8 border"> 
                  {/* Use placeholder as user.avatar does not exist on the type */}
                  <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt={user.name || 'My Avatar'} /> 
                  <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} /> 
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/40">
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
            disabled={!connected}
          />
          <Button
            onClick={sendMessage}
            disabled={!connected || newMessage.trim().length === 0}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}