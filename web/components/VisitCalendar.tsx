'use client';

import { getMyVisits, type VisitItem } from '@/lib/visit-api';
import {
  isValidDateKey,
  toDateKey,
  toVisitDate,
  toVisitDateKey,
} from '@/lib/visit-date';
import { VISITS_UPDATED_EVENT } from '@/lib/visit-sync';
import {
  DayButton,
  DayPicker,
  type DayButtonProps,
  type MonthCaptionProps,
} from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { CalendarDays, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'react-day-picker/style.css';

const CALENDAR_LOOKBACK_YEARS = 8;

type CalendarBounds = {
  startMonth: Date;
  endMonth: Date;
};

const getCalendarBounds = (today: Date): CalendarBounds => {
  const year = today.getFullYear();
  return {
    startMonth: new Date(year - CALENDAR_LOOKBACK_YEARS, 0, 1),
    endMonth: new Date(year, 11, 1),
  };
};

const isMonthInBounds = (bounds: CalendarBounds, year: number, month: number) => {
  const d = new Date(year, month, 1);
  return d >= bounds.startMonth && d <= bounds.endMonth;
};

const countVisitsInMonth = (visits: VisitItem[], year: number, month: number) =>
  visits.filter((visit) => {
    const d = toVisitDate(visit.visitedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

type VisitDayButtonProps = DayButtonProps & {
  visitCountByDay: Map<string, number>;
};

const VisitDayButton = ({
  visitCountByDay,
  ...props
}: VisitDayButtonProps) => {
  const [hover, setHover] = useState(false);
  const key = toDateKey(props.day.date);
  const count = visitCountByDay.get(key) ?? 0;

  return (
    <div
      className="visit-calendar-day-wrap"
      onMouseEnter={() => setHover(count > 0)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? (
        <span className="visit-calendar-day-tooltip" role="tooltip">
          관람 {count}건
        </span>
      ) : null}
      <DayButton {...props} />
    </div>
  );
};

type VisitMonthCaptionProps = MonthCaptionProps & {
  bounds: CalendarBounds;
  onMonthChange: (month: Date) => void;
};

const VisitMonthCaption = ({
  calendarMonth,
  bounds,
  onMonthChange,
  className,
  ...rest
}: VisitMonthCaptionProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const date = calendarMonth.date;
  const year = date.getFullYear();
  const monthIndex = date.getMonth();

  const years = useMemo(() => {
    const startYear = bounds.startMonth.getFullYear();
    const endYear = bounds.endMonth.getFullYear();
    const list: number[] = [];
    for (let y = startYear; y <= endYear; y++) list.push(y);
    return list;
  }, [bounds]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const pickYear = (nextYear: number) => {
    let nextMonth = monthIndex;
    if (!isMonthInBounds(bounds, nextYear, nextMonth)) {
      const found = Array.from({ length: 12 }, (_, i) => i).find((m) =>
        isMonthInBounds(bounds, nextYear, m),
      );
      if (found === undefined) return;
      nextMonth = found;
    }
    onMonthChange(new Date(nextYear, nextMonth, 1));
  };

  const pickMonth = (nextMonth: number) => {
    if (!isMonthInBounds(bounds, year, nextMonth)) return;
    onMonthChange(new Date(year, nextMonth, 1));
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`visit-calendar-caption${className ? ` ${className}` : ''}`}
      {...rest}
    >
      <button
        type="button"
        className="visit-calendar-caption-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{year}년 {monthIndex + 1}월</span>
        <ChevronDown
          className={`size-3.5 shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="visit-calendar-caption-panel" role="dialog" aria-label="연·월 선택">
          <div className="visit-calendar-caption-row">
            <span className="visit-calendar-caption-label">연도</span>
            <select
              className="visit-calendar-caption-select"
              value={year}
              aria-label="연도"
              onChange={(e) => pickYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>
          <div className="visit-calendar-caption-row">
            <span className="visit-calendar-caption-label">월</span>
            <select
              className="visit-calendar-caption-select"
              value={monthIndex}
              aria-label="월"
              onChange={(e) => pickMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, m) => m).map((m) => (
                <option key={m} value={m} disabled={!isMonthInBounds(bounds, year, m)}>
                  {m + 1}월
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const panelClass =
  'mt-3 rounded-xl border border-sky-200/50 bg-[var(--surface)] p-3 shadow-sm ring-1 ring-sky-100/50 dark:border-sky-500/20 dark:ring-sky-900/30';

export const VisitCalendar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(() => new Date());

  const today = useMemo(() => new Date(), []);

  const visitedKeys = useMemo(
    () => new Set(visits.map((v) => toVisitDateKey(v.visitedAt))),
    [visits],
  );

  const visitCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const visit of visits) {
      const key = toVisitDateKey(visit.visitedAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [visits]);

  const visitedDates = useMemo(() => {
    const dates: Date[] = [];
    for (const key of visitedKeys) {
      dates.push(toVisitDate(key));
    }
    return dates;
  }, [visitedKeys]);

  const monthVisitCount = useMemo(
    () => countVisitsInMonth(visits, month.getFullYear(), month.getMonth()),
    [visits, month],
  );

  const todayMonthVisitCount = useMemo(
    () => countVisitsInMonth(visits, today.getFullYear(), today.getMonth()),
    [visits, today],
  );

  const calendarBounds = useMemo(() => getCalendarBounds(today), [today]);

  const selected = useMemo(() => {
    if (!dateParam || !isValidDateKey(dateParam) || !visitedKeys.has(dateParam)) {
      return undefined;
    }
    return toVisitDate(dateParam);
  }, [dateParam, visitedKeys]);

  const pickerComponents = useMemo(
    () => ({
      MonthCaption: (props: MonthCaptionProps) => (
        <VisitMonthCaption
          {...props}
          bounds={calendarBounds}
          onMonthChange={setMonth}
        />
      ),
      DayButton: (props: DayButtonProps) => (
        <VisitDayButton {...props} visitCountByDay={visitCountByDay} />
      ),
    }),
    [calendarBounds, visitCountByDay],
  );

  useEffect(() => {
    if (selected) setMonth(selected);
  }, [selected]);

  useEffect(() => {
    const { startMonth, endMonth } = calendarBounds;
    setMonth((prev) => {
      const current = new Date(prev.getFullYear(), prev.getMonth(), 1);
      if (current < startMonth) return startMonth;
      if (current > endMonth) return endMonth;
      return prev;
    });
  }, [calendarBounds]);

  useEffect(() => {
    const loadCalendar = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError('');
      try {
        setVisits(await getMyVisits());
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : '관람 기록을 불러오는데 실패했습니다.',
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    void loadCalendar();

    const onVisitsUpdated = () => {
      void loadCalendar(false);
    };
    window.addEventListener(VISITS_UPDATED_EVENT, onVisitsUpdated);
    return () =>
      window.removeEventListener(VISITS_UPDATED_EVENT, onVisitsUpdated);
  }, []);

  const goToDate = (key: string) => {
    if (dateParam === key) {
      router.push('/mypage/visits');
      return;
    }
    router.push(`/mypage/visits?date=${key}`);
  };

  const onSelect = (date: Date | undefined) => {
    if (!date) {
      router.push('/mypage/visits');
      return;
    }
    const key = toDateKey(date);
    if (!visitedKeys.has(key)) return;
    goToDate(key);
  };

  const isDayDisabled = (date: Date) => !visitedKeys.has(toDateKey(date));

  const mobileSummary = (() => {
    if (selected) {
      const key = toDateKey(selected);
      const dayCount = visitCountByDay.get(key) ?? 0;
      return {
        href: dateParam ? `/mypage/visits?date=${dateParam}` : '/mypage/visits',
        label: `${selected.getMonth() + 1}월 ${selected.getDate()}일`,
        count: dayCount,
        suffix: '건',
      };
    }
    return {
      href: '/mypage/visits',
      label: `${today.getMonth() + 1}월`,
      count: todayMonthVisitCount,
      suffix: '건',
    };
  })();

  return (
    <>
      <div className={`${panelClass} lg:hidden`}>
        {loading ? (
          <p className="text-center text-xs text-muted">불러오는 중…</p>
        ) : error ? (
          <p className="text-xs text-error">{error}</p>
        ) : (
          <Link
            href={mobileSummary.href}
            className="flex items-center justify-between gap-3 transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <CalendarDays
                className="size-3.5 shrink-0 text-sky-500 dark:text-sky-400"
                aria-hidden
              />
              관람
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-sky-600 dark:text-sky-300">
                {mobileSummary.label}
              </span>
              {' · '}
              {mobileSummary.count}
              {mobileSummary.suffix}
            </span>
          </Link>
        )}
      </div>

      <div className={`${panelClass} hidden lg:block`}>
        <div className="mb-2 flex items-center gap-1.5">
          <CalendarDays
            className="size-3.5 shrink-0 text-sky-500 dark:text-sky-400"
            aria-hidden
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            관람 달력
          </span>
        </div>

        {loading ? (
          <p className="py-5 text-center text-xs text-muted">불러오는 중…</p>
        ) : error ? (
          <p className="text-xs text-error">{error}</p>
        ) : (
          <>
            <DayPicker
              mode="single"
              required={false}
              hideNavigation
              startMonth={calendarBounds.startMonth}
              endMonth={calendarBounds.endMonth}
              month={month}
              onMonthChange={setMonth}
              today={today}
              selected={selected}
              onSelect={onSelect}
              locale={ko}
              showOutsideDays={false}
              className="home-calendar my-page-visit-calendar"
              disabled={isDayDisabled}
              modifiers={{ visited: visitedDates }}
              modifiersClassNames={{ visited: 'visit-calendar-has-visit' }}
              components={pickerComponents}
            />

            <p className="mt-2 border-t border-sky-200/40 pt-2 text-center text-[10px] text-slate-600 dark:border-sky-500/15 dark:text-slate-300">
              {month.getMonth() + 1}월 {monthVisitCount}건
            </p>
          </>
        )}
      </div>
    </>
  );
};
