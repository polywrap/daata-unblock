import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import Providers from "./providers";
import BaseLayout from "./components/BaseLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unblock AI",
  description: "Get unblocked with Polywrap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
          <BaseLayout>{children}</BaseLayout>
        </body>
      </Providers>
    </html>
  );
}
