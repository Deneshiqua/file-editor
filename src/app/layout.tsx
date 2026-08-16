import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern File Manager Pro",
  description:
    "Modern File Manager Pro is a premium file management component for Next.js applications with upload, preview, editing, drag and drop, and flexible storage adapters. Includes docs for FileManagerConfig, RestAdapter, and SupabaseAdapter.",
  keywords: [
    "nextjs",
    "file manager",
    "modern file manager pro",
    "react",
    "file upload",
    "file browser",
    "npm package",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
