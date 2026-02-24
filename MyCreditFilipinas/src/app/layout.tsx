import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyCredit Filipinas",
  description: "Lending company management system based in Davao, Philippines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

