import { exportService } from "@/services/export.service";

// Consumidor externo: el asesor (y su sesión semanal), no la propia app. Ver Equipo/contratos.md · C3.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!exportService.configurado()) return Response.json({ error: "Exportación no configurada" }, { status: 503 });
  if (!exportService.autorizado(req.headers.get("authorization"))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const tema = new URL(req.url).searchParams.get("tema");
  return Response.json(await exportService.leer(tema), { headers: { "Cache-Control": "no-store" } });
}
