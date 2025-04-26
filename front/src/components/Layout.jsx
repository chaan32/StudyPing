"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BookOpen, LogOut, MessageSquare } from "./icons/Icons"
import { useAuth } from "../contexts/AuthContext"

function Layout({ children }) {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>스터디메이트</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/browse" className="text-sm font-medium hover:underline">
              스터디 찾기
            </Link>
            <Link to="/create" className="text-sm font-medium hover:underline">
              스터디 만들기
            </Link>

            {isLoggedIn && (
              <Link to="/chats" className="text-sm font-medium hover:underline flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>채팅</span>
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {user?.avatar?.substring(0, 2) || "사용"}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                    <Link to="/my-studies" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      내 스터디
                    </Link>
                    <Link to="/chats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      채팅 목록
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm transition-all"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0 bg-white">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-gray-500">© 2024 스터디메이트. All rights reserved.</p>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="#" className="text-gray-500 hover:underline">
              이용약관
            </Link>
            <Link to="#" className="text-gray-500 hover:underline">
              개인정보처리방침
            </Link>
            <Link to="#" className="text-gray-500 hover:underline">
              문의하기
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default Layout
