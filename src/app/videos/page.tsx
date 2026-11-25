import { VideosView } from "@/features/videos";
import { contentService } from "@/services/content.service";

export default async function Page() {
  return <VideosView videos={await contentService.videosDelCurso()} />;
}
