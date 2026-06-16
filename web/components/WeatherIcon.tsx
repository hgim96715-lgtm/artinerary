import type { WeatherCategory } from '@/lib/weather';
import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  Sun,
} from 'lucide-react';

type Props = {
  category: WeatherCategory;
  className?: string;
};

export const WeatherIcon = ({ category, className = 'size-4' }: Props) => {
  switch (category) {
    case 'clear':
      return <Sun className={`${className} text-amber-500`} aria-hidden />;
    case 'cloudy':
      return <Cloud className={className} aria-hidden />;
    case 'fog':
      return <CloudFog className={className} aria-hidden />;
    case 'rain':
    case 'showers':
      return <CloudRain className={className} aria-hidden />;
    case 'snow':
      return <CloudSnow className={className} aria-hidden />;
    default:
      return <Cloud className={className} aria-hidden />;
  }
};
