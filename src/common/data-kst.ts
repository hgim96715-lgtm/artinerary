export const getTodayRangeKst = () => {
  const iso = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Seoul',
  });
  return {
    date: iso,
    start: new Date(`${iso}T00:00:00+09:00`),
    end: new Date(`${iso}T23:59:59.999+09:00`),
  };
};
