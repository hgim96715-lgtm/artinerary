'use client';

import { changePassword, me, updateNickname } from '@/lib/auth-api';
import { PasswordInput } from '@/components/PasswordInput';
import { KeyRound, Mail, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const blockClass =
  'space-y-4 rounded-xl border border-dashed border-sky-200/80 bg-sky-50/70 p-4 sm:p-5 dark:border-sky-500/30 dark:bg-sky-950/30';

const blockTitleClass =
  'flex items-center gap-2 text-sm font-bold text-sky-600 dark:text-sky-300';

export default function MyPageSettingsPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await me();
        setNickname(user.nickname);
        setEmail(user.email);
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  const onSubmitNickname: React.SubmitEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateNickname(nickname.trim());
      setSuccess(result.message);
      setNickname(result.nickname);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitPassword: React.SubmitEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();
    if (passwordSubmitting) return;

    setPasswordSubmitting(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const result = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.',
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">불러오는 중…</p>;
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">
        내 정보 수정
      </h2>

      <section className={blockClass}>
        <h3 className={blockTitleClass}>
          <Sparkles className="size-4" aria-hidden />
          닉네임
        </h3>
        <form onSubmit={onSubmitNickname} className="max-w-md space-y-3">
          <div>
            <label htmlFor="nickname" className="label-field">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              minLength={2}
              maxLength={10}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <p className="mt-1.5 text-xs text-amber-900/55 dark:text-amber-100/55">
              2~10자 · 한글·영문·숫자·밑줄
            </p>
          </div>
          {error ? <p className="text-error">{error}</p> : null}
          {success ? <p className="text-success">{success}</p> : null}
          <button type="submit" disabled={submitting} className="btn-accent">
            {submitting ? '저장 중…' : '닉네임 저장'}
          </button>
        </form>
      </section>

      <section className={blockClass}>
        <h3 className={blockTitleClass}>
          <Mail className="size-4" aria-hidden />
          이메일
        </h3>
        <p className="max-w-md rounded-lg border border-sky-200/50 bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-slate-800 dark:border-sky-500/20 dark:bg-sky-950/25 dark:text-slate-100">
          {email}
        </p>
        <p className="text-xs text-amber-900/55 dark:text-amber-100/55">
          이메일 변경은 추후 지원 예정이에요.
        </p>
      </section>

      <section className={blockClass}>
        <h3 className={blockTitleClass}>
          <KeyRound className="size-4" aria-hidden />
          비밀번호
        </h3>
        <form onSubmit={onSubmitPassword} className="max-w-md space-y-3">
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label="현재 비밀번호"
            autoComplete="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="새 비밀번호"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            hint="8자 이상"
          />
          {passwordError ? <p className="text-error">{passwordError}</p> : null}
          {passwordSuccess ? (
            <p className="text-success">{passwordSuccess}</p>
          ) : null}
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="btn-accent"
          >
            {passwordSubmitting ? '변경 중…' : '비밀번호 변경'}
          </button>
        </form>
      </section>
    </div>
  );
}
