import { CursoView } from "@/features/curso";
import { contentService } from "@/services/content.service";

export default async function Page() {
  return <CursoView curso={await contentService.getCurso()} />;
}
