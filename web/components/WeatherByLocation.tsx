'use client';

import { WeatherIcon } from '@/components/WeatherIcon';
import { WeatherCategory, weatherTip } from '@/lib/weather';
import { Droplets, MapPin, Thermometer } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

type Weather = {
  location: string | null;
  temp: number;
  humidity: number;
  label: string;
  category: WeatherCategory;
};

type Status = 'idle' | 'loading' | 'error' | 'ready' | 'denied';

const WeatherMessage = ({ children }: { children: ReactNode }) => (
  <section className="exhibition-book-intro home-panel flex h-full flex-col justify-center">
    <p className="text-sm text-muted">{children}</p>
  </section>
);

export const WeatherByLocation = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}`,
          );
          if (!res.ok) {
            throw new Error('날씨 정보를 가져오는데 실패했습니다.');
          }
          const data = (await res.json()) as Weather;
          if (
            typeof data.temp !== 'number' ||
            typeof data.humidity !== 'number' ||
            !data.label ||
            !data.category
          ) {
            throw new Error('invalid weather payload');
          }
          setWeather(data);
          setStatus('ready');
        } catch {
          setStatus('error');
        }
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  if (status === 'loading' || status === 'idle') {
    return (
      <section
        className="exhibition-book-intro home-panel flex h-full flex-col gap-3"
        aria-busy="true"
      >
        <div className="h-3 w-28 animate-pulse rounded-full bg-amber-900/10" />
        <div className="flex items-end justify-between gap-4">
          <div className="h-12 w-24 animate-pulse rounded-xl bg-amber-900/10" />
          <div className="h-10 w-16 animate-pulse rounded-xl bg-amber-900/10" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-amber-900/10" />
      </section>
    );
  }

  if (status === 'denied') {
    return (
      <WeatherMessage>
        위치 권한이 없어서 날씨를 못 보여줘요. 브라우저에서 위치 허용 후
        새로고침해 주세요.
      </WeatherMessage>
    );
  }

  if (status === 'error' || !weather) {
    return (
      <WeatherMessage>
        날씨 정보를 가져오는데 실패했습니다. 다시 시도해 주세요.
      </WeatherMessage>
    );
  }

  const tip = weatherTip(weather.category);

  return (
    <section className="exhibition-book-intro home-panel flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="exhibition-book-intro-title !mb-0">오늘의 날씨</h2>
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <MapPin className="size-3.5 shrink-0 text-rose-400" aria-hidden />
          <span className="truncate font-medium">
            {weather.location ?? '내 위치'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-2">
          <Thermometer
            className="mt-2 size-4 shrink-0 text-rose-400/80"
            aria-hidden
          />
          <div className="flex items-start gap-0.5">
            <span className="text-5xl font-bold tabular-nums tracking-tight">
              {Math.round(weather.temp)}
            </span>
            <span className="mt-2 text-lg text-gray-500 dark:text-amber-50/60">
              °C
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-2xl bg-amber-900/5 px-4 py-3 dark:bg-amber-100/5">
          <WeatherIcon category={weather.category} className="size-9" />
          <span className="text-sm font-semibold">{weather.label}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/10 bg-white/60 px-3 py-1 text-xs dark:border-amber-100/10 dark:bg-black/20">
          <Droplets className="size-3.5 text-sky-500" aria-hidden />
          습도 {weather.humidity}%
        </span>
      </div>

      {tip ? (
        <p className="mt-auto rounded-xl border border-rose-300/40 bg-gradient-to-r from-rose-50 to-amber-50 px-4 py-2.5 text-sm font-medium text-rose-900/90 dark:border-rose-400/20 dark:from-rose-950/40 dark:to-amber-950/30 dark:text-rose-100/90">
          {tip}
        </p>
      ) : null}
    </section>
  );
};
