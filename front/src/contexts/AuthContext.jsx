"use client"

import { createContext, useState, useContext, useEffect } from "react"

// 기본 사용자 정보
const defaultUser = {
  id: 1,
  name: "사용자",
  avatar: "사용",
  email: "user@example.com",
}

// Context 생성
const AuthContext = createContext(null)

// Context Provider 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 함수
  const login = (userData = defaultUser) => {
    console.log("로그인 시도:", userData)
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("isLoggedIn", "true")
    console.log("로그인 상태:", true)
  }

  // 로그아웃 함수
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
  }

  // 컴포넌트 마운트 시 로컬 스토리지에서 로그인 상태 확인
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn")

    if (storedIsLoggedIn === "true" && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
      console.log("저장된 로그인 정보 복원")
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
