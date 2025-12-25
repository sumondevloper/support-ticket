// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProviders } from "./providers/QueryProviders"; 
import  {Toaster}  from "./components/ui/sonner";  

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Frontend Assignment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProviders>{children}</QueryProviders>
        <Toaster />
      </body>
    </html>
  );
}