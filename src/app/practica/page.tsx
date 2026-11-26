import { PracticaView } from "@/features/repaso";
import { contentService } from "@/services/content.service";

export default async function Page() {
  return <PracticaView curso={await contentService.getCurso()} />;
}
