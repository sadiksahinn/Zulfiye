import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
import { AuthProvider } from "@/components/providers/AuthProvider";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import ZulfiyeLoader from "@/components/ZulfiyeLoader";
import ResetPWA from "@/components/system/ResetPWA";
import OfflineBanner from "@/components/OfflineBanner";

export const metadata: Metadata = {
  title: "Zülfiye Canbolat Gelinlik",
  description: "Gelinlik yönetim sistemi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#c9a84c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={cormorant.variable}>
        <ResetPWA />
        <AuthProvider>
          <ZulfiyeLoader />
          {children}
          <MobileNavigation />
          <OfflineBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
