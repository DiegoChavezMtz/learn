import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RepasoView } from "@/features/repaso";
import { evaluarExplicacion } from "@/features/tutor";
import { contentService } from "@/services/content.service";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await contentService.getCurso()).modulos.flatMap((m) => m.temas.filter((t) => t.leccion).map((t) => ({ tema: t.id })));
}

export default async function Page({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  const leccion = await contentService.getLeccion(tema).catch(() => null);
  if (!leccion) return notFound();
  return <Suspense><RepasoView leccion={leccion} evaluar={evaluarExplicacion} /></Suspense>;
}
