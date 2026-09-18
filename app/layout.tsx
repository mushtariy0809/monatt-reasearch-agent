import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Monatt Trend Intelligence",
  description:
    "Fashion, culture and pricing intelligence for the Monatt streetwear brand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Sidebar />
        <main className="min-h-screen lg:ml-60">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
