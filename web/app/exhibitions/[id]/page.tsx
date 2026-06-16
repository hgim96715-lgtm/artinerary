import { ExhibitionDetailMeta } from '@/components/ExhibitionDetailMeta';
import { ExhibitionUserActions } from '@/components/ExhibitionUserActions';
import { getExhibition } from '@/lib/api';
import { formatDescriptionForDisplay } from '@/lib/description';
import {
  formatExhibitionTitle,
  getExhibitionStatus,
} from '@/lib/format';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function ExhibitionsDetailPage({ params }: Props) {
  const { id } = await params;
  const exhibition = await getExhibition(id);
  if (!exhibition) {
    notFound();
  }
  const status = getExhibitionStatus(
    exhibition.startDate,
    exhibition.endDate,
  );
  const title = formatExhibitionTitle(exhibition.title);

  return (
    <article className="exhibition-detail">
      <Link href="/exhibitions" className="link-back">
        <ArrowLeft />
        <span>전시 목록 보기</span>
      </Link>

      <div className="exhibition-book">
        <div className="exhibition-book-cover-wrap">
          <div className="exhibition-book-cover">
            {exhibition.imageUrl ? (
              <img src={exhibition.imageUrl} alt="" />
            ) : (
              <div className="exhibition-book-cover-placeholder">
                <span className="exhibition-book-cover-deco" aria-hidden>
                  ✦
                </span>
                <p>{title}</p>
              </div>
            )}
            <span
              className={`exhibition-book-ribbon exhibition-book-ribbon--${status.label === '진행중' ? 'ongoing' : status.label === '예정' ? 'upcoming' : 'ended'}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="exhibition-book-page">
          <p className="exhibition-book-eyebrow">exhibition note</p>
          <h1 className="exhibition-book-title">{title}</h1>

          <ExhibitionUserActions exhibitionId={exhibition.id} />

          <ExhibitionDetailMeta exhibition={exhibition} />
        </div>
      </div>

      <section className="exhibition-book-intro">
        <h2 className="exhibition-book-intro-title">소개</h2>
        {exhibition.description ? (
          <p className="exhibition-book-intro-body leading-relaxed whitespace-pre-wrap">
            {formatDescriptionForDisplay(exhibition.description)}
          </p>
        ) : (
          <p className="exhibition-book-intro-body opacity-70">
            자세한 설명은 홈페이지를 참고해 주세요.
          </p>
        )}
        {exhibition.sourceUrl && (
          <a
            href={exhibition.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="exhibition-book-link mt-4 inline-flex text-sm"
          >
            홈페이지 바로가기 →
          </a>
        )}
      </section>
    </article>
  );
}
