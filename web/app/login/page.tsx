'use client';

import { login } from '@/lib/auth-api';
import { resolveLoginRedirect } from '@/lib/login-redirect';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(resolveLoginRedirect(from, user.role));
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === '인증에 실패했습니다.') {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-card-title">로그인</h1>
          <p className="auth-card-desc">Artinerary 계정으로 로그인하세요.</p>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? '로그인 중…' : '로그인'}
          </button>
        </form>
        <p className="auth-card-footer">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="link-action">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-muted">불러오는 중…</p>}>
      <LoginForm />
    </Suspense>
  );
}
