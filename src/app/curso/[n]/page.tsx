import { notFound } from "next/navigation";
import { ModuloView } from "@/features/curso";
import { contentService } from "@/services/content.service";

export async function generateStaticParams() {
  return (await contentService.getCurso()).modulos.map((m) => ({ n: String(m.n) }));
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const modulo = (await contentService.getCurso()).modulos.find((m) => String(m.n) === n);
  return modulo ? <ModuloView modulo={modulo} /> : notFound();
}
