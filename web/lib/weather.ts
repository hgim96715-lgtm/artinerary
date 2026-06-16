export type WeatherCategory =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'other';

export const weatherCategory = (code: number): WeatherCategory => {
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  return 'other';
};

export const weatherLabel = (code: number) => {
  if (code === 0) return '맑음';
  if (code <= 3) return '구름';
  if (code <= 48) return '안개';
  if (code <= 67) return '비';
  if (code <= 77) return '눈';
  if (code <= 82) return '소나기';
  return '날씨';
};

export const weatherTip = (category: WeatherCategory) => {
  if (category === 'clear' || category === 'cloudy') {
    return '전시 가기 좋은 날씨예요!! 🤩';
  }
  if (category === 'rain' || category === 'snow' || category === 'showers') {
    return '실내 전시가 더 편해요!! 😊';
  }
  return null;
};
