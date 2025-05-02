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

export default function ChatComponent({ studyId, studyTitle }: { studyId: number; studyTitle?: string }) {
  const { user } = useAuth() // Remove token from here
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const [token, setToken] = useState<string | null>(null); // Add state for token
  // Use useRef for the stomp client to avoid issues with state updates in useEffect
  const stompClientRef = useRef<CompatClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Effect to load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  // WebSocket Connection Effect
  useEffect(() => {
    if (!studyId || !user || !token) {
      console.log("WebSocket: Missing studyId, user, or token. Skipping connection.")
      return // Don't connect if essential info is missing
    }

    // Prevent multiple connections
    if (stompClientRef.current && stompClientRef.current.active) {
        console.log("WebSocket: Connection already active or activating.");
        return;
    }


    console.log("WebSocket: Attempting to connect...")

    const socket = new SockJS(`http://localhost:8080/connect`) // Use absolute backend URL
    const client = Stomp.over(socket)

    








    client.configure({
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Include Bearer token
      },
      debug: (str) => {
        console.log("STOMP DEBUG:", str) // Enable STOMP debugging
      },
      reconnectDelay: 5000, // Attempt reconnect every 5 seconds
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      console.log("WebSocket Connected:", frame)
      setConnected(true)

      // Subscribe to the study-specific topic
      const subscription = client.subscribe(`/topic/chat/study/${studyId}`, (message) => {
        try {
          const receivedMsgDto = JSON.parse(message.body)
          console.log("Message received:", receivedMsgDto)

          // Transform backend DTO to frontend Message format
          const frontendMsg: Message = {
            // Use a unique key, messageId from backend if available, otherwise generate
            id: receivedMsgDto.messageId || `${receivedMsgDto.senderId}-${Date.now()}`,
            sender: {
              id: receivedMsgDto.senderId,
              name: receivedMsgDto.senderName || "Unknown User", // Handle missing sender name
              avatar: receivedMsgDto.senderAvatar || "/placeholder.svg?height=40&width=40", // Use placeholder if avatar missing
            },
            content: receivedMsgDto.message,
            timestamp: new Date(receivedMsgDto.timestamp || Date.now()), // Use timestamp if available
            isMe: user ? receivedMsgDto.senderId === user.id : false, // Check if senderId matches current user's ID
          }
          // Avoid adding duplicate messages if backend sends history + live message quickly
          setMessages((prev) => {
            if (prev.some(msg => msg.id === frontendMsg.id)) {
                 return prev; // Don't add if ID already exists
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
      // Optionally try to reconnect or notify the user
    }

    client.onWebSocketError = (error) => {
        console.error("WebSocket Error:", error);
        setConnected(false);
         // Attempt to clean up stomp client ref if connection fails early
        stompClientRef.current = null;
    };

    client.onWebSocketClose = (event) => {
        console.log("WebSocket Closed:", event);
        setConnected(false);
        stompClientRef.current = null; // Ensure ref is cleared on close
        // Consider implementing automatic reconnection logic here if needed
    };

    // Start the connection
    try {
        client.activate();
        stompClientRef.current = client; // Store the client in the ref AFTER activation attempt
    } catch (error) {
        console.error("Failed to activate STOMP client:", error);
        stompClientRef.current = null; // Clear ref on activation failure
    }


    // Cleanup function on component unmount or dependency change
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
       stompClientRef.current = null; // Ensure ref is cleared definitively on cleanup
       setConnected(false); // Ensure connection status is reset
    }
  }, [studyId, user, token]) // Rerun effect if studyId, user, or token changes

  // Scroll to bottom effect
  useEffect(() => {
    if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger only when messages array changes


  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) {
        console.warn("Cannot send empty message.");
        return;
    }
    if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.warn("Cannot send message: STOMP client not connected.");
        // Optionally, you could queue the message or notify the user
        return;
    }
    if (!user) {
        console.warn("Cannot send message: User not available.");
        return;
    }


    const chatMessageDto = {
      senderId: user.id, // Send current user's ID
      message: newMessage,
      roomId: studyId, // Include roomId (studyId) - Ensure backend expects this field name
      senderName: user.name, // Optionally include sender name if needed by backend on publish
      // timestamp: new Date().toISOString() // Optionally include timestamp if backend needs it
    }

    try {
      stompClientRef.current.publish({
        destination: `/publish/chat/${studyId}`, // Backend endpoint prefix might be different (e.g., /app/publish/chat/{studyId})
        body: JSON.stringify(chatMessageDto),
        // headers: { Authorization: `Bearer ${token}` } // Headers might not be needed for publish if connection is authenticated
      })
      console.log("Message sent:", chatMessageDto)
      setNewMessage("") // Clear input after sending
    } catch (error) {
        console.error("Failed to send message via STOMP:", error)
    }

  }

  // 날짜 포맷 함수
  const formatDate = (date: Date | string) => {
      try {
          // Ensure date is a Date object before formatting
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          // Check if the date is valid
          if (isNaN(dateObj.getTime())) {
              return "Invalid date";
          }
          return format(dateObj, "yyyy-MM-dd HH:mm"); // Example format
      } catch (error) {
          console.error("Error formatting date:", error, date);
          return "Date error";
      }
  }


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] border rounded-lg">
      <header className="p-4 border-b bg-muted/40">
        <h2 className="text-lg font-semibold">{studyTitle || `Study Chat #${studyId}`}</h2>
        <p className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
          {connected ? "Connected" : "Disconnected"}
        </p>
      </header>
      <ScrollArea className="flex-1 p-4 bg-background/90"> {/* Added background color */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? "justify-end" : ""}`}>
              {!msg.isMe && (
                <Avatar className="w-8 h-8 border"> {/* Added border */}
                  <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                  <AvatarFallback>{msg.sender.name ? msg.sender.name.slice(0, 2).toUpperCase() : '??'}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[70%] shadow-sm ${msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {!msg.isMe && <p className="text-xs font-medium mb-1">{msg.sender.name || 'Unknown User'}</p>}
                <p className="text-sm break-words">{msg.content}</p> {/* Added break-words */}
                <p className={`text-xs mt-1 text-right ${msg.isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}> {/* Added text-right */}
                  {formatDate(msg.timestamp)}
                </p>
              </div>
              {msg.isMe && user && ( // Check if user exists before rendering own avatar
                <Avatar className="w-8 h-8 border"> {/* Added border */}
                  {/* Use placeholder for user's avatar as it's not in useAuth user object */}
                  <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt={user.name || msg.sender.name} />
                  <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* This helps scroll to bottom */}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/40">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!connected || !newMessage.trim()}>Send</Button>
        </form>
      </div>
    </div>
  )
}