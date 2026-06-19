'use client';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FilterChip } from '@/components/FilterChip';
import {
  adminNotices,
  deleteNotice,
  type AdminNoticeListItem,
} from '@/lib/admin-api';
import { formatDate } from '@/lib/format';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type PublishFilter = 'all' | 'published' | 'draft';

const noticeDate = (item: AdminNoticeListItem) =>
  formatDate(item.publishedAt ?? item.createdAt);

export default function AdminNoticesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminNoticeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminNoticeListItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setRows(await adminNotices());
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
        );
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  const filteredRows = rows.filter((row) => {
    if (publishFilter === 'published' && !row.isPublished) return false;
    if (publishFilter === 'draft' && row.isPublished) return false;
    return true;
  });

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteNotice(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="page-title">공지 목록</h1>
        <Link href="/admin/notices/new" className="btn-primary gap-2">
          <Plus className="size-4" aria-hidden />
          공지 작성
        </Link>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: 'all', label: '전체' },
            { value: 'published', label: '게시' },
            { value: 'draft', label: '초안' },
          ] as const
        ).map(({ value, label }) => (
          <FilterChip
            key={value}
            as="button"
            active={publishFilter === value}
            onClick={() => setPublishFilter(value)}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      {!loading && rows.length > 0 && (
        <p className="text-muted" role="status">
          {publishFilter !== 'all'
            ? `${filteredRows.length}건 (전체 ${rows.length}건)`
            : `${rows.length}건`}
        </p>
      )}

      {loading ? (
        <p className="text-muted">목록을 불러오는 중입니다.</p>
      ) : rows.length === 0 ? (
        <p className="text-muted">등록된 공지가 없습니다.</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-muted">
          {publishFilter === 'published'
            ? '게시된 공지가 없습니다.'
            : '초안 공지가 없습니다.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredRows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {row.isPinned ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/50 dark:text-sky-100">
                      고정
                    </span>
                  ) : null}
                  <span
                    className={
                      row.isPublished
                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }
                  >
                    {row.isPublished ? '게시' : '초안'}
                  </span>
                  <span className="font-medium">{row.title}</span>
                </div>
                <time
                  className="text-muted text-xs"
                  dateTime={row.publishedAt ?? row.createdAt}
                >
                  {noticeDate(row)}
                </time>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/notices/${row.id}/edit`}
                  className="btn-secondary gap-1.5 px-3 py-1.5 text-sm"
                >
                  <Pencil className="size-3.5" aria-hidden />
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  disabled={deleting}
                  className="btn-secondary gap-1.5 px-3 py-1.5 text-sm text-error hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="공지 삭제"
        description={
          <>
            정말로 삭제하시겠습니까?
            {deleteTarget && (
              <p className="mt-1 font-medium text-foreground">
                {deleteTarget.title}
              </p>
            )}
          </>
        }
        confirmLabel="삭제"
        cancelLabel="아니요"
        confirming={deleting}
        confirmingLabel="삭제 중…"
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}