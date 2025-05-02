'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; 
import styles from './signup.module.css'; 

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/member/create', 
        { email, name, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, 
        }
      );

      console.log('Signup successful, status:', response.status);
      alert('회원가입 성공! 로그인 해주세요.');
      router.push('/login'); 

    } catch (err: any) { 
      let errorMsg = '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.';
      if (axios.isAxiosError(err)) {
        console.error('Axios signup error:', err.response?.status, err.response?.data);
        if (err.response) {
          if (err.response.data?.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.status === 409) {
            errorMsg = '이미 사용 중인 이메일입니다.';
          } else {
            errorMsg = `회원가입 실패: ${err.response.statusText || '서버 오류'}`;
          }
        } else if (err.request) {
            errorMsg = '서버로부터 응답이 없습니다. 네트워크를 확인해주세요.';
        }
      } else {
        console.error('Non-Axios signup error:', err);
      }
      setError(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>회원가입</h1>
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
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
            placeholder="이름을 입력하세요"
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
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>회원가입</button>
      </form>
      <p className={styles.loginLink}>
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </p>
    </div>
  );
}
