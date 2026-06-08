import Link from "next/link";

export default function NotFound() {
    return (
        <div>
            <h1>찾을수 없는 전시회입니다.</h1>
            <Link href="/exhibitions">목록으로 돌아가기</Link>
        </div>
    )
}