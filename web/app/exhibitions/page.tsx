import { getExhibitions } from "@/lib/api";
import Link from "next/link";

export default async function ExhibitionsPage() {
    const exhibitions=await getExhibitions();
    return (
      <div>
        <h1>Exhibitions</h1>
        <ul>
          {exhibitions.map((exhibition) => (
           <li key={exhibition.id}>
            <Link href={`/exhibitions/${exhibition.id}`}>{exhibition.title}-{exhibition.id}</Link>
           </li>
          ))}
        </ul>
      </div>
    );
  }
