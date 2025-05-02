'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/auth-provider';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/member/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, 
        }
      );

      console.log('Login response status:', response.status);

      const token = response.data.token;

      console.log('Token from response header:', token);

      if (token) {
        const cleanedToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        localStorage.setItem('accessToken', cleanedToken);
        console.log('Token stored from header:', cleanedToken);
      } else {
          console.warn('Token not found in response header.');
          // 헤더에 없으면 본문에서도 찾아볼 수 있습니다 (필요하다면)
          // if (response.data?.token) { ... }
      }

      // 2. 사용자 ID 저장 (응답 본문에서)
      if (response.data?.id) {
        const userId = response.data.id;
        const userName = response.data.name;

        localStorage.setItem('userId', userId);
        console.log('User ID stored:', userId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('name', userName);

        // AuthProvider 상태 업데이트
        login(userId, userName); 

      } else {
        console.warn('User ID (id) not found in response body.');
      }
      router.push('/'); 

    } catch (err: any) { 
      let errorMsg = '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';
      if (axios.isAxiosError(err)) {
        console.error('Axios login error:', err.response?.status, err.response?.data);
        if (err.response) {
          if (err.response.data?.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.status === 401) {
            errorMsg = '이메일 또는 비밀번호가 잘못되었습니다.';
          } else {
            errorMsg = `로그인 실패: ${err.response.statusText || '서버 오류'}`;
          }
        } else if (err.request) {
          errorMsg = '서버로부터 응답이 없습니다. 네트워크를 확인해주세요.';
        } 
      } else {
        console.error('Non-Axios login error:', err);
      }
      setError(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>로그인</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>로그인</button>
      </form>
      <p className={styles.signupLink}>
        계정이 없으신가요? <a href="/signup">회원가입</a>
      </p>
    </div>
  );
}
