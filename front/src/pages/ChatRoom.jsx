"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext"; 
import { ArrowLeft } from "../components/icons/Icons";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function ChatRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams(); 
  const { user, token } = useAuth(); 

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null); 
  const messagesEndRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  useEffect(() => {
    if (!roomId){
      console.error("Room ID is missing.");
      return;
    }
    if (!token){
      console.error("Token is missing.");
      return;
    }
    if (!user){
      console.error("User info is missing.");
      return;
    }

    if (stompClientRef.current) {
      console.log("Already connected or connecting.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"), 
      connectHeaders: {
        Authorization: `Bearer ${token}`, 
      },
      debug: function (str) {
        console.log("STOMP Debug: ", str);
      },
      reconnectDelay: 5000, 
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("STOMP Connected: ", frame);
      setIsConnected(true);

      client.subscribe(`/topic/${roomId}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          console.log("Received message: ", receivedMessage);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        } catch (error) {
          console.error("Failed to parse message body: ", error);
          console.error("Raw message body: ", message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
      setIsConnected(false);
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket error: ", event);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      console.log("STOMP Disconnected");
      setIsConnected(false);
    };

    console.log("Activating STOMP client...");
    client.activate(); 

    stompClientRef.current = client; 

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("Deactivating STOMP client...");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
      }
    };
  }, [roomId, token, user]); 

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const sendMessage = (event) => {
    event.preventDefault(); 
    if (messageInput.trim() && stompClientRef.current && stompClientRef.current.connected && user) {
      const chatMessage = {
        senderId: user.id, 
        message: messageInput.trim(),
      };

      try {
        console.log(`Sending message to /pub/${roomId}:`, chatMessage);
        stompClientRef.current.publish({
          destination: `/pub/${roomId}`, 
          body: JSON.stringify(chatMessage),
        });
        setMessageInput(""); 
      } catch (error) {
        console.error("Failed to send message: ", error);
      }
    } else {
      console.log("Cannot send message: Not connected, message empty, or user missing.");
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp; 
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-[calc(100vh-100px)]"> 
            {/* 헤더 */}
            <div className="p-4 border-b flex items-center bg-gray-50 shrink-0"> 
              <button
                onClick={() => navigate("/chats")} 
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-bold text-lg">Chat Room {roomId}</h1>
                <p className="text-sm text-gray-500">Study Group Chat</p>
              </div>
              <div className="ml-auto flex items-center">
                <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? "연결됨" : "연결 끊김"}
                </span>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`w-full flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-start max-w-[70%] ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {msg.senderId !== user?.id && (
                           <p className="text-xs font-semibold mb-1 text-gray-600">{msg.senderId}</p> 
                        )}
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'} text-right`}>
                          {formatMessageTime(msg.timestamp)} 
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 메시지 입력 */}
            <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white shrink-0">
              <input
                type="text"
                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중이거나 끊겼습니다..."}
                value={messageInput}
                onChange={handleInputChange}
                disabled={!isConnected}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!isConnected || !messageInput.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all disabled:bg-gray-300"
              >
                전송
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChatRoom;
