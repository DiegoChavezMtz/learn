import { notFound } from "next/navigation";
import { LibroView } from "@/features/libro";
import { contentService } from "@/services/content.service";

export const dynamicParams = false;

export async function generateStaticParams() {
  const temas = (await contentService.getCurso()).modulos.flatMap((m) => m.temas.map((t) => t.id));
  return (await Promise.all(temas.map(async (tema) => ((await contentService.hayLibro(tema)) ? [{ tema }] : [])))).flat();
}

export default async function Page({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  return (await contentService.hayLibro(tema)) ? <LibroView libro={await contentService.getLibro(tema)} /> : notFound();
}
