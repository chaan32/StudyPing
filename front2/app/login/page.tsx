'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/auth-provider';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/api/member/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // withCredentials might not be needed with proxy, test this
          // withCredentials: true, 
        }
      );

      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);

      const token = response.data?.token;

      console.log('Token from response body:', token);

      if (token && response.data?.id && response.data?.name) {
        localStorage.setItem('accessToken', token);
        console.log('Token stored from body:', token);

        const userId = response.data.id.toString();
        const userName = response.data.name;

        localStorage.setItem('userId', userId);
        console.log('User ID stored:', userId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('name', userName);

        login(userId, userName); 

        router.push('/'); 

      } else {
        console.error('Login successful but token or user data missing in response.');
        setError('Login failed: Incomplete data received from server.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('name');
      }

    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('name');

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Login failed: Invalid email or password.');
        } else {
          setError(`Login failed: Server responded with status ${err.response.status}`);
        }
      } else {
        setError('Login failed: Could not connect to server or unexpected error.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>로그인</h1>
      <form onSubmit={handleLogin} className={styles.form}>
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
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button type="submit" className={styles.button}>로그인</button>
      </form>
      <p className={styles.signupLink}>
        계정이 없으신가요? <a href="/signup">회원가입</a>
      </p>
    </div>
  );
}
