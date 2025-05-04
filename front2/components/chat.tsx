import React, { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider" // Assuming useAuth provides user and token
import SockJS from "sockjs-client"
import { CompatClient, Stomp } from "@stomp/stompjs"
import { format } from "date-fns" // Import date-fns format function

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
  const { user } = useAuth() 
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const [token, setToken] = useState<string | null>(null); 
  const stompClientRef = useRef<CompatClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!studyId || !user || !token) {
      console.log("WebSocket: Missing studyId, user, or token. Skipping connection.")
      return 
    }

    if (stompClientRef.current && stompClientRef.current.active) {
        console.log("WebSocket: Connection already active or activating.");
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
      console.log("WebSocket Connected:", frame)
      setConnected(true)

      const subscription = client.subscribe(`/topic/chat/study/${studyId}`, (message) => {
        try {
          const receivedMsgDto = JSON.parse(message.body)
          console.log("Message received:", receivedMsgDto)

          const frontendMsg: Message = {
            id: receivedMsgDto.messageId || `${receivedMsgDto.senderId}-${Date.now()}`,
            sender: {
              id: receivedMsgDto.senderId,
              name: receivedMsgDto.senderName || "Unknown User", 
              avatar: receivedMsgDto.senderAvatar || "/placeholder.svg?height=40&width=40", 
            },
            content: receivedMsgDto.message,
            timestamp: new Date(receivedMsgDto.timestamp || Date.now()), 
            isMe: user ? receivedMsgDto.senderId === user.id : false, 
          }
          setMessages((prev) => {
            if (prev.some(msg => msg.id === frontendMsg.id)) {
                return prev; 
            }
            return [...prev, frontendMsg];
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
        client.activate();
        stompClientRef.current = client; 
    } catch (error) {
        console.error("Failed to activate STOMP client:", error);
        stompClientRef.current = null; 
    }


    return () => {
      console.log("ChatComponent cleanup initiated.");
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("WebSocket Deactivating connection...");
        try {
          stompClientRef.current.deactivate();
        } catch (error) {
          console.error("Error during STOMP deactivation:", error);
        }
      } else {
        console.log("WebSocket Cleanup: No active connection found in ref to deactivate.");
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
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div'); 
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] border rounded-lg">
      <header className="p-4 border-b bg-muted/40">
        <h2 className="text-lg font-semibold">{studyTitle || `Study Chat #${studyId}`}</h2>
        <p className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
          {connected ? "Connected" : "Disconnected"}
        </p>
      </header>
      <ScrollArea className="flex-1 p-4 bg-background/90" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? "justify-end" : ""}`}>
              {!msg.isMe && (
                <Avatar className="w-8 h-8 border"> 
                  <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                  <AvatarFallback>{msg.sender.name ? msg.sender.name.slice(0, 2).toUpperCase() : '??'}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[70%] shadow-sm ${msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {!msg.isMe && <p className="text-xs font-medium mb-1">{msg.sender.name || 'Unknown User'}</p>}
                <p className="text-sm break-words">{msg.content}</p> 
                <p className={`text-xs mt-1 text-right ${msg.isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}> 
                  {format(msg.timestamp, "yyyy-MM-dd HH:mm")}
                </p>
              </div>
              {msg.isMe && user && ( 
                <Avatar className="w-8 h-8 border"> 
                  <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt={user.name || msg.sender.name} />
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