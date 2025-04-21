"use client"

import { useAuth } from "../contexts/AuthContext"

function QuickLogin() {
  const { login, isLoggedIn, logout, user } = useAuth()

  const handleQuickLogin = () => {
    login()
    alert("로그인 되었습니다!")
  }

  const handleLogout = () => {
    logout()
    alert("로그아웃 되었습니다!")
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">빠른 로그인</h3>
      {isLoggedIn ? (
        <div>
          <p className="text-sm mb-2">
            <span className="font-medium">{user?.name}</span>님으로 로그인됨
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-all"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          onClick={handleQuickLogin}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all"
        >
          빠른 로그인
        </button>
      )}
    </div>
  )
}

export default QuickLogin
