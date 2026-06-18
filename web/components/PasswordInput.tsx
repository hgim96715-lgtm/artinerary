'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  hint?: string;
};

export const PasswordInput = ({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  minLength = 8,
  hint,
}: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="label-field">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          name={name}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {hint ? (
        <p className="mt-1.5 text-xs text-amber-900/55 dark:text-amber-100/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
