import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Signup() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth() // login 제거됨 (자동 로그인 사용 안함)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 이미 로그인되어 있으면 홈으로 리다이렉트
  if (isLoggedIn) {
    navigate("/")
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !passwordConfirm) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      // 요청 데이터 구성 - MemberSaveReqDto에 맞게 필드명 확인
      const requestData = {
        name,
        email,
        password
      };
      
      console.log('요청 데이터:', requestData);
      
      // 서버에 회원가입 요청 보내기 (완전한 URL 사용)
      const response = await fetch('/member/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      })
      
      console.log('응답 상태:', response.status, response.statusText);
      console.log('응답 헤더:', [...response.headers.entries()]);

      // 응답 해석
      const responseText = await response.text();
      console.log('원래 응답:', responseText);
      
      // 응답이 JSON이 아니거나 비어있는 경우 처리
      let responseData = null;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (e) {
        console.error('JSON 해석 오류:', e);
      }
      
      if (!response.ok) {
        throw new Error((responseData && responseData.message) || '회원가입에 실패했습니다.');
      }

      // 응답이 {id, name, message} 구조의 응답을 반환함
      console.log('회원가입 성공, 응답 데이터:', responseData);
      
      // 회원가입 성공 메시지 표시
      setSuccess('회원가입이 성공적으로 완료되었습니다! 로그인해주세요.');
      
      // 폼 초기화
      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      
      // 3초 후 로그인 페이지로 자동 이동
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "회원가입에 실패했습니다. 다시 시도해주세요.")
      console.error('회원가입 오류:', err)
    }
  }








  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">회원가입</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
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
            
            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              회원가입
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
