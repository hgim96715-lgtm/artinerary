'use client';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FilterChip } from '@/components/FilterChip';
import { SourceBadge } from '@/components/SourceBadge';
import { VisibleBadge } from '@/components/VisibleBadge';
import {
  adminCollect,
  type AdminExhibitionRow,
  adminExhibitions,
  adminLogout,
  adminMe,
  type CollectResult,
  deleteExhibition,
} from '@/lib/admin-api';
import { formatExhibitionTitle } from '@/lib/format';
import { DownloadIcon, Loader2, PlusIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type VisibleFilter = 'all' | 'visible' | 'hidden';
type SourceFilter = 'all' | 'manual' | 'api';

export default function AdminExhibitionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminExhibitionRow[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [visibleFilter, setVisibleFilter] = useState<VisibleFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminExhibitionRow | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<CollectResult | null>(null);
  const [collectConfirmOpen, setCollectConfirmOpen] = useState(false);

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

  useEffect(() => {
    if (!deleteTarget || deleting) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) {
        setDeleteTarget(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, deleting]);

  useEffect(() => {
    if (!collectConfirmOpen || collecting) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setCollectConfirmOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [collectConfirmOpen, collecting]);

  async function onLogout() {
    try {
      await adminLogout();
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteExhibition(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  }
  async function onCollect() {
    if (collecting) return;
    setCollectConfirmOpen(false);
    setCollecting(true);
    setError('');
    setCollectResult(null);
    try {
      const result = await adminCollect();
      setCollectResult(result);
      setRows(await adminExhibitions());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '수집에 실패했습니다.');
    } finally {
      setCollecting(false);
    }
  }

  const filteredRows = rows.filter((row) => {
    if (visibleFilter === 'visible' && !row.isVisible) return false;
    if (visibleFilter === 'hidden' && row.isVisible) return false;
    if (sourceFilter === 'manual' && row.source !== 'MANUAL') return false;
    if (sourceFilter === 'api' && row.source !== 'API') return false;

    const q = query.trim().toLowerCase();
    if (!q) return true;
    const title = formatExhibitionTitle(row.title).toLowerCase();
    const venueName = (row.venueName ?? '').toLowerCase();
    const area = (row.area ?? '').toLowerCase();
    return title.includes(q) || venueName.includes(q) || area.includes(q);
  });

  const hasActiveFilter =
    query.trim() !== '' ||
    visibleFilter !== 'all' ||
    sourceFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">전시 관리</h1>
        <div className="flex items-center gap-3 text-sm">
          {email && <span>{email}</span>}
          <button type="button" onClick={onLogout} className="link-action">
            로그아웃
          </button>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}
      {collecting && (
        <p
          className="text-muted flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          문화 API 전시 수집 중입니다. 수십 분 걸릴 수 있으니 탭을 닫지 마세요.
        </p>
      )}
      {collectResult && !collecting && (
        <p className="text-success" role="status">
          수집 완료 — 저장 {collectResult.upserted}건, 건너뜀 {collectResult.skipped}
          건, 실패 {collectResult.failed}건
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="admin-search" className="label-field">
            검색
          </label>
          <input
            id="admin-search"
            type="search"
            placeholder="제목 · 장소 · 지역"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={collecting}
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCollectConfirmOpen(true)}
            disabled={collecting || loading}
            aria-busy={collecting}
            className="btn-secondary gap-2 disabled:opacity-50"
          >
            {collecting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <DownloadIcon className="size-4" aria-hidden="true" />
            )}
            {collecting ? '수집 중…' : 'API 수집'}
          </button>
          <Link
            href="/admin/exhibitions/new"
            className={`btn-primary gap-2 ${collecting ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={collecting}
            tabIndex={collecting ? -1 : undefined}
          >
            <PlusIcon className="size-4" />
            전시 등록
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { value: 'all', label: '전체' },
            { value: 'visible', label: '공개' },
            { value: 'hidden', label: '비공개' },
          ] as const
        ).map(({ value, label }) => (
          <FilterChip
            key={value}
            as="button"
            active={visibleFilter === value}
            onClick={() => !collecting && setVisibleFilter(value)}
            className={collecting ? 'pointer-events-none opacity-50' : ''}
          >
            {label}
          </FilterChip>
        ))}
        <span className="hidden text-gray-300 sm:inline" aria-hidden="true">
          |
        </span>
        {(
          [
            { value: 'all', label: '전체' },
            { value: 'manual', label: 'MANUAL' },
            { value: 'api', label: 'API' },
          ] as const
        ).map(({ value, label }) => (
          <FilterChip
            key={`source-${value}`}
            as="button"
            tone="amber"
            active={sourceFilter === value}
            onClick={() => !collecting && setSourceFilter(value)}
            className={collecting ? 'pointer-events-none opacity-50' : ''}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      {!loading && rows.length > 0 && (
        <p className="text-muted" role="status">
          {hasActiveFilter
            ? `${filteredRows.length}건 (전체 ${rows.length}건)`
            : `${rows.length}건`}
        </p>
      )}

      {loading ? (
        <p className="text-muted">목록을 불러오는 중입니다.</p>
      ) : rows.length === 0 ? (
        <p className="text-muted">등록된 전시가 없습니다.</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-muted">
          {query.trim()
            ? `"${query.trim()}" 검색 결과가 없습니다.`
            : visibleFilter === 'visible'
              ? '공개된 전시가 없습니다.'
              : visibleFilter === 'hidden'
                ? '비공개된 전시가 없습니다.'
                : sourceFilter === 'manual'
                  ? 'MANUAL 전시가 없습니다.'
                  : sourceFilter === 'api'
                    ? 'API 전시가 없습니다.'
                    : '등록된 전시가 없습니다.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredRows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <p className="font-medium">{formatExhibitionTitle(row.title)}</p>
                <p className="text-muted flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span>{row.venueName ?? '장소 없음'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{row.area ?? '지역 없음'}</span>
                  <span aria-hidden="true">·</span>
                  <SourceBadge source={row.source} />
                  <span aria-hidden="true">·</span>
                  <VisibleBadge isVisible={row.isVisible} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/exhibitions/${row.id}/edit`}
                  className="link-action"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="btn-danger"
                  aria-label={`${formatExhibitionTitle(row.title)} 삭제`}
                >
                  <TrashIcon className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="전시 삭제"
        description={
          <>
            정말로 삭제하시겠습니까?
            {deleteTarget && (
              <p className="mt-1 font-medium text-foreground">
                {formatExhibitionTitle(deleteTarget.title)}
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
      <ConfirmDialog
        open={collectConfirmOpen}
        title="API 수집"
        description={
          <>
            <p>문화 API에서 전시 목록을 가져와 DB에 반영합니다.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              <li>수십 분 정도 걸릴 수 있습니다.</li>
              <li>수집 중에는 이 탭을 닫지 마세요.</li>
              <li>admin이 보정한 필드는 유지됩니다.</li>
            </ul>
          </>
        }
        confirmLabel="수집 시작"
        cancelLabel="취소"
        cancelClassName="btn-secondary"
        confirmClassName="btn-primary"
        onConfirm={onCollect}
        onCancel={() => setCollectConfirmOpen(false)}
      />
    </div>
  );
}
