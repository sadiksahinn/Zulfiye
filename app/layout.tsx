import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAUNA Couture ERP",
  description: "Luxury couture management system",
  manifest: "/manifest.json",
  themeColor: "#b69463",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MAUNA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
