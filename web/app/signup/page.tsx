'use client';

import { signup } from '@/lib/auth-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup({ email, password, nickname });
      router.push('/login');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-card-title">회원가입</h1>
          <p className="auth-card-desc">
            전시 탐색과 기록을 위해 계정을 만드세요.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label-field">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label-field">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* 나중에: 영문·숫자·특수문자 조합 8자 이상 */}
            <p className="text-muted mt-1">8자 이상</p>
          </div>
          <div>
            <label htmlFor="nickname" className="label-field">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              minLength={2}
              maxLength={10}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <p className="text-muted mt-1">
              2~10자 · 한글·영문·숫자·밑줄만 사용 가능
            </p>
          </div>
          {error && <p className="text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? '가입 중…' : '회원가입'}
          </button>
        </form>
        <p className="auth-card-footer">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="link-action">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
