"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({ error, reset }: Props) {
    const pathname=usePathname()
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">
        오류가 발생해서 전시를 불러오지 못했습니다.
      </h1>
      <p className="text-muted">
        API 서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인한 뒤 다시
        시도해 주세요.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400">오류 코드: {error.digest}</p>
      )}
      <div className="flex items-center gap-4 mt-2">
        <button
          type="button"
          onClick={reset}
          className="btn-accent">
          다시 시도
        </button>
        {pathname !=='/' && (
        <Link href={"/"} className="btn-secondary">
            홈으로
        </Link>
        )}
      </div>
    </div>
  );
};

