import { notFound } from "next/navigation";
import { TemaView } from "@/features/curso";
import { contentService } from "@/services/content.service";

export async function generateStaticParams() {
  return (await contentService.getCurso()).modulos.flatMap((m) => m.temas.map((t) => ({ tema: t.id })));
}

export default async function Page({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  const todos = (await contentService.getCurso()).modulos.flatMap((m) => m.temas.map((t) => ({ t, m })));
  const i = todos.findIndex((x) => x.t.id === tema);
  if (i < 0) return notFound();
  const videos = todos[i].t.leccion ? await contentService.videosPublicados(tema) : [];
  return (
    <TemaView
      tema={todos[i].t} modulo={todos[i].m} anterior={todos[i - 1]?.t} siguiente={todos[i + 1]?.t}
      hayLibro={await contentService.hayLibro(tema)} videos={videos}
    />
  );
}
