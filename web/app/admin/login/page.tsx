'use client';

import { adminLogin } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      router.push('/admin/exhibitions');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') {
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
    <div className="max-w-sm space-y-6">
      <h1 className="page-title">관리자 로그인</h1>
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
            placeholder="admin@example.com"
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
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-error">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
