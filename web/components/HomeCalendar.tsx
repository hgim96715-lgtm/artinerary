'use client';

import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { useMemo } from 'react';
import 'react-day-picker/style.css';

export const HomeCalendar = () => {
  const today = useMemo(() => new Date(), []);

  return (
    <section className="exhibition-book-intro home-panel flex h-full flex-col gap-2">
      <h2 className="exhibition-book-intro-title !mb-0">오늘</h2>
      <div className="flex flex-1 items-start justify-center">
        <DayPicker
          mode="single"
          selected={today}
          onSelect={() => {}}
          defaultMonth={today}
          locale={ko}
          showOutsideDays
          className="home-calendar"
          disabled 
        />
      </div>
    </section>
  );
};
