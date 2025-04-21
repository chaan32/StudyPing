"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // 실제로는 서버에 인증 요청을 보내야 하지만,
    // 임시로 바로 로그인 처리
    login()
    onClose()
    // 디버깅용 콘솔 로그 추가
    console.log("로그인 완료!")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">로그인</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="이메일 주소"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="비밀번호"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
            >
              로그인
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              아직 계정이 없으신가요?{" "}
              <a href="#" className="text-blue-500 hover:underline">
                회원가입
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
