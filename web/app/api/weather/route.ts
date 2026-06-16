import { weatherCategory, weatherLabel } from '@/lib/weather';
import { NextRequest, NextResponse } from 'next/server';

const shortenRegion = (name: string) =>
  name.replace(/특별시|광역시|특별자치시|특별자치도/g, '').trim();

const resolveLocationName = async (lat: string, lon: string) => {
  try {
    const geoUrl =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}` +
      `&format=json&accept-language=ko`;
    const geoRes = await fetch(geoUrl, {
      headers: {
        'User-Agent': 'Artinerary/1.0 (https://artinerary-web.vercel.app)',
      },
      next: { revalidate: 3600 },
    });
    if (!geoRes.ok) return null;

    const geo = (await geoRes.json()) as {
      address?: {
        city?: string;
        town?: string;
        county?: string;
        borough?: string;
        suburb?: string;
        state?: string;
      };
    };

    const { city, town, county, borough, suburb, state } = geo.address ?? {};
    const region = city ?? town ?? county ?? state;
    const district = borough ?? suburb;

    if (region && district && district !== region) {
      return `${shortenRegion(region)} ${district}`;
    }
    if (region) return region;
    if (district) return district;
    return null;
  } catch {
    return null;
  }
};

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lon = req.nextUrl.searchParams.get('lon');
  if (!lat || !lon) {
    return NextResponse.json(
      { message: 'lat, lon 필요합니다.' },
      { status: 400 },
    );
  }

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,relative_humidity_2m` +
    `&timezone=Asia%2FSeoul`;

  const [forecastRes, location] = await Promise.all([
    fetch(forecastUrl, { next: { revalidate: 300 } }),
    resolveLocationName(lat, lon),
  ]);

  if (!forecastRes.ok) {
    return NextResponse.json(
      { message: '날씨 정보를 가져오는데 실패했습니다.' },
      { status: 502 },
    );
  }

  const data = (await forecastRes.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
      relative_humidity_2m?: number;
    };
  };

  const temp = data.current?.temperature_2m;
  const humidity = data.current?.relative_humidity_2m;
  const code = data.current?.weather_code;

  if (temp == null || humidity == null || code == null) {
    return NextResponse.json(
      { message: '날씨 데이터 형식이 올바르지 않습니다.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    location,
    temp,
    humidity,
    label: weatherLabel(code),
    category: weatherCategory(code),
  });
}
