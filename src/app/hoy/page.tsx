import { redirect } from "next/navigation";

// La vista principal ahora es el Mapa (/).
export default function Page() {
  redirect("/");
}
