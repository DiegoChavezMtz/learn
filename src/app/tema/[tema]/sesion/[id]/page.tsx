import { notFound } from "next/navigation";
import { SesionView } from "@/features/sesion";
import { evaluarExplicacion } from "@/features/tutor";
import { contentService } from "@/services/content.service";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await contentService.getCurso()).modulos.flatMap((m) =>
    m.temas.flatMap((t) => (t.leccion ?? { sesiones: [] }).sesiones.map((s) => ({ tema: t.id, id: s.id }))),
  );
}

export default async function Page({ params }: { params: Promise<{ tema: string; id: string }> }) {
  const { tema, id } = await params;
  const leccion = await contentService.getLeccion(tema).catch(() => null);
  if (!leccion) return notFound();
  return <SesionView leccion={leccion} sesionId={id} evaluar={evaluarExplicacion} />;
}
