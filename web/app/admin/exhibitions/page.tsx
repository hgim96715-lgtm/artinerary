'use client';

import {
  type AdminExhibitionRow,
  adminExhibitions,
  adminLogout,
  adminMe,
} from '@/lib/admin-api';
import { formatExhibitionTitle } from '@/lib/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminExhibitionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminExhibitionRow[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminPage() {
      setLoading(true);
      setError('');
      try {
        const me = await adminMe();
        setEmail(me.email);
        setRows(await adminExhibitions());
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    loadAdminPage();
  }, [router]);

  async function onLogout() {
    try {
      await adminLogout();
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">전시 관리</h1>
        <div className="flex items-center gap-3 text-sm">
          {email && <span>{email}</span>}
          <button
            type="button"
            onClick={onLogout}
            className="underline hover:text-blue-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">목록을 불러오는 중입니다.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">등록된 전시가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div>
                <p className="font-medium">{formatExhibitionTitle(row.title)}</p>
                <p className="text-sm text-gray-500">
                  {row.area ?? '지역 없음'} · {row.source} ·{' '}
                  {row.isVisible ? '공개' : '비공개'}
                </p>
              </div>
              <Link
                href={`/admin/exhibitions/${row.id}/edit`}
                className="text-sm underline hover:text-blue-600"
              >
                수정
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
