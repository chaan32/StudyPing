"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { ArrowLeft } from "../components/icons/Icons";
import SockJS from "sockjs-client";
import Stomp from "@stomp/stompjs";

function ChatRoom() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="py-6">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 헤더 */}
            <div className="p-4 border-b flex items-center bg-gray-50">
              <button
                onClick={() => navigate("/chats")}
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-bold text-lg">title</h1>
                <p className="text-sm text-gray-500">subtitle</p>
              </div>
              <div className="ml-auto flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span className="text-xs text-green-500">연결됨</span>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="w-full flex flex-col">
                  <div className={`flex items-start`}>
                    <div className={`max-w-[80%] p-3 rounded-lg`}>
                      <p>message.text</p>
                      <p className={`text-xs mt-1 text-right`}>
                        formatMessageTime(message.timestamp)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 메시지 입력 */}
            <form className="p-3 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder={"메시지를 입력하세요..."}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
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
