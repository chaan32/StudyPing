"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// 사용자 타입 정의 (localStorage에서 가져올 정보 기준)
export interface User {
  id: string | number;
  name: string;       
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userId: string, userName: string, token: string) => void;
  logout: () => void;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로그인 상태 확인 (localStorage 기반)
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("name"); 

    if (storedToken && userId && userName) {
      setUser({ id: userId, name: userName });
      setToken(storedToken);
      // Optionally verify token validity here before setting user/token
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
  };

  // logout 함수를 context value로 제공 (handleLogout 호출)
  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
