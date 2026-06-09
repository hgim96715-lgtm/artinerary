import { NotFoundMessage } from "@/components/NotFoundMessage";

export default function NotFound(){
    return(
        <NotFoundMessage
        title="찾을 수 없는 페이지입니다."
        description="존재하지 않는 페이지입니다."
        backHref="/"
        backLabel="홈으로"/>
    )
}