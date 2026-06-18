import { getExhibitionAreas } from '@/lib/api';
import { formatToday, formatTodayISO } from '@/lib/format';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AreaExhibitionChart } from '@/components/AreaExhibitionChart';
import { WeatherByLocation } from '@/components/WeatherByLocation';
import { HomeCalendar } from '@/components/HomeCalendar';

export default async function Home() {
  const areas = await getExhibitionAreas('ongoing');

  return (
    <div className="space-y-6">
      <section className="exhibition-book-intro home-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-0.5">
            <time
              dateTime={formatTodayISO()}
              className="block text-sm font-medium text-sky-400/90"
            >
              {formatToday()}
            </time>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              지금 열리는 전시 🎨
            </h1>
            <p className="pt-0.5 text-sm text-muted">
              지역별로 진행 중인 전시를 확인해 보세요.
            </p>
          </div>
          <Link
            href="/exhibitions?status=ongoing"
            className="btn-accent inline-flex shrink-0 items-center gap-2 self-start sm:self-center"
          >
            전시 목록 보기
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <WeatherByLocation />
        <HomeCalendar />
      </div>

      <AreaExhibitionChart areas={areas} status="ongoing" />
    </div>
  );
}
