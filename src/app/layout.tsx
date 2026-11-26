import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/atoms/ServiceWorker";
import { TabBar } from "@/components/organisms/TabBar";
import { SesionGate } from "@/features/acceso";
import { ProgresoProvider } from "@/context/ProgresoContext";
import { SyncProvider } from "@/context/SyncContext";
import "@/styles/globals.css";

const disp = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-disp", weight: ["600", "800"], display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Aprender",
  description: "Estudio diario: redes y ciberseguridad",
  appleWebApp: { capable: true, title: "Aprender", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#120b12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${disp.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ServiceWorker />
        <ProgresoProvider>
          <SyncProvider>
            <SesionGate>
              {children}
              <TabBar />
            </SesionGate>
          </SyncProvider>
        </ProgresoProvider>
      </body>
    </html>
  );
}
