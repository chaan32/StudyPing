"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 사용자 타입 정의
export interface User {
  id: number
  name: string
  email: string
  avatar: string
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 더미 사용자 데이터
const dummyUser: User = {
  id: 1,
  name: "사용자",
  email: "user@example.com",
  avatar: "/placeholder.svg?height=32&width=32",
}

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로그인 상태 확인 (실제로는 토큰 검증 등을 수행)
  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (loggedIn) {
      setUser(dummyUser)
    }

    setIsLoading(false)
  }, [])

  // 로그인 함수
  const login = () => {
    setUser(dummyUser)
    localStorage.setItem("isLoggedIn", "true")
  }

  // 로그아웃 함수
  const logout = () => {
    setUser(null)
    localStorage.setItem("isLoggedIn", "false")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

// 인증 컨텍스트 사용을 위한 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
