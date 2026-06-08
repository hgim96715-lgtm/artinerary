import { NotFoundMessage } from "@/components/NotFoundMessage";
import Link from "next/link";

export default function NotFound() {
    return (
        <NotFoundMessage
        title="찾을 수 없는 전시회입니다."
        description="존재하지 않는 전시회 페이지입니다."
        backHref="/exhibitions"
        backLabel="전시 목록 보기"/>
    )
}