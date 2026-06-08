import { getExhibition } from "@/lib/api";
import { notFound } from "next/navigation";

type Props={params:Promise<{id:string}>}

export default async function ExhibitionsDetailPage({params}:Props) {
    const {id}=await params;
    const exhibition=await getExhibition(id);
    if (!exhibition) {
      notFound();
    }
  return (
    <div>
      <h1>Exhibitions Detail Page</h1>
      <h2>{exhibition.title}</h2>
      <p>{exhibition.description}</p>
    </div>
  );
}
