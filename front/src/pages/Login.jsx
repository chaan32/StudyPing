import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Login() {
  const navigate = useNavigate()
  const { login, isLoggedIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // 이미 로그인되어 있으면 홈으로 리다이렉트
  if (isLoggedIn) {
    navigate("/")
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.")
      return
    }

    try {
      // 요청 데이터 구성
      const requestData = {
        email,
        password
      };
      
      console.log('로그인 요청 데이터:', requestData);
      
      // 서버에 로그인 요청 보내기 (완전한 URL 사용)
      const response = await fetch('http://localhost:8080/member/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      })
      
      console.log('로그인 응답 상태:', response.status, response.statusText);

      // 응답 해석
      const responseText = await response.text();
      console.log('원래 로그인 응답:', responseText);
      
      let responseData = null;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (e) {
        console.error('JSON 해석 오류:', e);
      }

      if (!response.ok) {
        throw new Error((responseData && responseData.message) || '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.')
      }
      
      console.log('로그인 성공, 응답 데이터:', responseData);
      
      console.log('로그인 성공, 응답 데이터:', responseData);
      
      // 사용자 데이터 구성
      const userData = {
        id: responseData?.id || 1,
        name: responseData?.name || '사용자',
        avatar: (responseData?.name || '사용').substring(0, 2),
        email: email,
      };
      
      // AuthContext의 login 함수 호출
      login(userData)
      
      navigate("/")
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.")
      console.error('로그인 오류:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">로그인</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
