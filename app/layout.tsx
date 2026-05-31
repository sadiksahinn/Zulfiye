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
import MaunaLoader from "@/components/MaunaLoader";
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
      <body className={cormorant.variable}>
        <ResetPWA />
        <AuthProvider>
            <MaunaLoader />
          {children}
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
