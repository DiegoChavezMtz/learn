import { HoyView } from "@/features/hoy";
import { contentService } from "@/services/content.service";

export default async function Page() {
  return <HoyView curso={await contentService.getCurso()} />;
}
