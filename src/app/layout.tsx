import "./global.css";

import type { ReactNode } from "react";
import { Provider } from "./provider";
import { Geist, Geist_Mono } from "next/font/google";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
export const metadata = createMetadata({
  title: {
    template: "%s | A2A",
    default: "A2A",
  },
  description: "Google Agent2Agent (A2A) Protocol",
  metadataBase: baseUrl,
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#fff" },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <Provider>
          {children}
          <Toaster richColors />
        </Provider>
      </body>
    </html>
  );
}
