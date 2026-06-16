import {
  formatDateRange,
  formatExhibitionPrice,
  formatLocationDetail,
  getMapsSearchUrl,
} from '@/lib/format';
import type { Exhibition } from '@/lib/types/exhibition';
import { ExternalLink, Calendar, MapPin, Ticket } from 'lucide-react';

type Props = {
  exhibition: Pick<
    Exhibition,
    | 'startDate'
    | 'endDate'
    | 'venueName'
    | 'area'
    | 'address'
    | 'latitude'
    | 'longitude'
    | 'priceText'
    | 'feeType'
  >;
};

export function ExhibitionDetailMeta({ exhibition }: Props) {
  const location = formatLocationDetail(exhibition);
  const mapsUrl = getMapsSearchUrl(exhibition);
  const price = formatExhibitionPrice(exhibition);

  return (
    <ul className="exhibition-book-facts">
      <li className="exhibition-book-fact">
        <span className="exhibition-book-fact-label">
          <Calendar className="size-3.5" aria-hidden />
          기간
        </span>
        <span className="exhibition-book-fact-value">
          {formatDateRange(exhibition.startDate, exhibition.endDate)}
        </span>
      </li>

      {location && (
        <li className="exhibition-book-fact">
          <span className="exhibition-book-fact-label">
            <MapPin className="size-3.5" aria-hidden />
            장소
          </span>
          <span className="exhibition-book-fact-value">
            {location.venueName && (
              <span className="block font-medium">{location.venueName}</span>
            )}
            {(location.address || location.region) && (
              <span className="block text-[0.92em] leading-snug opacity-80">
                {[location.address, location.region]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="exhibition-book-link mt-1 inline-flex items-center gap-1"
              >
                지도에서 보기
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </span>
        </li>
      )}

      <li className="exhibition-book-fact">
        <span className="exhibition-book-fact-label">
          <Ticket className="size-3.5" aria-hidden />
          가격
        </span>
        <span className="exhibition-book-fact-value">{price}</span>
      </li>
    </ul>
  );
}
