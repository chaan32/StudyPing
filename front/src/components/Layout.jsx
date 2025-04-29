"use client"

import { Link, useNavigate } from "react-router-dom"
import { BookOpen, LogOut, MessageSquare } from "./icons/Icons"
import { useAuth } from "../contexts/AuthContext"

function Layout({ children }) {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()

  const handleLogout = () => {
    logout()
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
            {isLoggedIn && (
              <>
                <Link to="/chats" className="text-sm font-medium hover:underline flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>채팅</span>
                </Link>
                <Link to="/my-studies" className="text-sm font-medium hover:underline">
                  내 스터디
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* 사용자 프로필 - 드롭다운 없이 표시 */}
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                    {user?.name?.substring(0, 1) || "?"}  
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name || "사용자"}</span>
                </div>

                {/* 로그아웃 버튼 - 항상 표시 */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
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
          <p className="text-sm text-gray-500"> 2024 스터디메이트. All rights reserved.</p>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="#" className="text-gray-500 hover:underline">
              
            </Link>
            <Link to="#" className="text-gray-500 hover:underline">
             
            </Link>
            <Link to="#" className="text-gray-500 hover:underline">
             
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default Layout
