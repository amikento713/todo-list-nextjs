import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "My Tasks — Productivity Dashboard",
  description: "Track tasks, deadlines, and notifications in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
