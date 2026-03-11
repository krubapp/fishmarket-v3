import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "material-symbols";
import "./globals.css";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/hooks/useToast";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fishmarket",
  description: "Fishmarket",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<QueryProvider>
          <AuthProvider>
            <AuthGuard>
              <ToastProvider>{children}</ToastProvider>
            </AuthGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
