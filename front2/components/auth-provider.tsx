"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import axios from "axios"; // Import axios

// 사용자 타입 정의 (localStorage에서 가져올 정보 기준)
export interface User {
  id: string | number;
  name: string;       
}

// Interface for joined chat room data (matches ChatRoomListResDto)
interface JoinedChatRoom {
  roomId: number; // Corresponds to study ID for routing
  title: string;
  unReadCount: number;
}

// Type for the API response structure
interface ChatRoomApiResponse {
    dtos: JoinedChatRoom[];
    member_id: number;
    message: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userId: string, userName: string, token: string) => void;
  logout: () => void;
  joinedChatRooms: JoinedChatRoom[];
  isLoadingChats: boolean;
  fetchJoinedChatRooms: () => Promise<void>;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedChatRooms, setJoinedChatRooms] = useState<JoinedChatRoom[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // 초기 로그인 상태 확인 (localStorage 기반)
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("name"); 

    if (storedToken && userId && userName) {
      setUser({ id: userId, name: userName });
      setToken(storedToken);
    } else {
      handleLogout(); 
    }
    setIsLoading(false);
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn"); 
    localStorage.removeItem("name"); 
    setUser(null);
    setToken(null);
    setJoinedChatRooms([]);
  };

  // 로그인 함수 정의
  const login = (newUserId: string, newUserName: string, newToken: string) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('name', newUserName); 
    setUser({ id: newUserId, name: newUserName });
    setToken(newToken);
    console.log('AuthProvider: User logged in', newUserId, newUserName);
    fetchJoinedChatRooms(); // Call fetch function after setting user/token
  };

  // logout 함수를 context value로 제공 (handleLogout 호출)
  const logout = () => {
    handleLogout();
  };

  const fetchJoinedChatRooms = useCallback(async () => {
    const currentToken = localStorage.getItem("accessToken"); 
    const currentUserId = localStorage.getItem("userId");   

    if (currentUserId && currentToken) {
      console.log("[AuthContext] Fetching joined chat rooms for user:", currentUserId);
      setIsLoadingChats(true);
      try {
        const response = await axios.get<ChatRoomApiResponse>(`/api/study/find/joined/chatting/${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
        const chatRooms = (response.data && Array.isArray(response.data.dtos)) ? response.data.dtos : [];
        setJoinedChatRooms(chatRooms);
        console.log("[AuthContext] Set joinedChatRooms state:", chatRooms);
      } catch (error) {
        console.error("[AuthContext] Error fetching joined chat rooms:", error);
        if (axios.isAxiosError(error)) {
          console.error("[AuthContext] Axios error details:", error.response?.data);
        }
        setJoinedChatRooms([]); 
      } finally {
        setIsLoadingChats(false);
      }
    } else {
      console.log("[AuthContext] Cannot fetch chat rooms: User or token missing.");
      setJoinedChatRooms([]); 
    }
  }, []); 

  useEffect(() => {
    if (user && token) {
      fetchJoinedChatRooms();
    }
  }, [user, token, fetchJoinedChatRooms]); 

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, joinedChatRooms, isLoadingChats, fetchJoinedChatRooms }}>
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트 사용 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
