import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import ResetPWA from "@/components/system/ResetPWA";

export const metadata: Metadata = {
  title: "MAUNA Couture ERP",
  description: "Luxury couture management system",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#b69463",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <ResetPWA />
        <AuthProvider>
          {children}
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
