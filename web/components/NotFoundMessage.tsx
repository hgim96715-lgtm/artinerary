import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props={
    title:string;
    description:string;
    backHref?:string;
    backLabel?:string;
}

export const NotFoundMessage=({title,description,backHref,backLabel}:Props)=>{
    return(
        <div className="flex flex-col items-center jusify-cener py-16 text-center space-y">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-gray-500 mt-2">{description}</p>}
            {backHref && backLabel && (
                <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mt-4">
                    <ArrowLeft/>
                    <span>{backLabel??'뒤로가기'}</span>
                </Link>
            )}
        </div>
    )
}