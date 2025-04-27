"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from 'axios';

// 기본 사용자 정보
const defaultUser = {
  id: 1,
  name: "사용자",
  avatar: "사용",
  email: "user@example.com",
}

// Context 생성
const AuthContext = createContext(null)

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Context Provider 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)

  // 로그인 함수 (토큰을 파라미터로 추가)
  const login = (userData = defaultUser, accessToken = null) => {
    console.log("로그인 시도:", userData)
    setUser(userData)
    setIsLoggedIn(true)
    
    // 토큰이 있는 경우 저장
    if (accessToken) {
      setToken(accessToken)
      localStorage.setItem("accessToken", accessToken)
    }
    
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("isLoggedIn", "true")
    console.log("로그인 상태:", true)
  }

  // 로그아웃 함수
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("accessToken")
  }

  // Bearer 토큰을 사용하여 API 요청 보내는 함수
  const authRequest = async (endpoint, options = {}) => {
    try {
      const currentToken = token || localStorage.getItem("accessToken");
      
      if (!currentToken) {
        throw new Error('인증 토큰이 없습니다.');
      }
      
      // 기본 config
      const config = {
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${currentToken}` // Bearer 접두사 추가
        },
        ...options
      };
      
      // 요청 방법에 따라 API 호출
      const method = options.method?.toLowerCase() || 'get';
      
      if (method === 'get') {
        return await api.get(endpoint, config);
      } else if (method === 'post') {
        return await api.post(endpoint, options.data, config);
      } else if (method === 'put') {
        return await api.put(endpoint, options.data, config);
      } else if (method === 'delete') {
        return await api.delete(endpoint, config);
      }
      
    } catch (error) {
      console.error('인증 요청 오류:', error);
      throw error;
    }
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 로그인 상태 확인
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
    const storedToken = localStorage.getItem("token")

    if (storedIsLoggedIn === "true" && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
      if (storedToken) {
        setToken(storedToken)
      }
      console.log("저장된 로그인 정보 복원")
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoggedIn, token, login, logout, authRequest }}>{children}</AuthContext.Provider>
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
