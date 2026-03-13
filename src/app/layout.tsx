import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "material-symbols";
import "./globals.css";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PageTransition } from "@/components/PageTransition";
import { CartFloatingButton } from "@/components/CartFloatingButton";
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
            <CartProvider>
              <AuthGuard>
<ToastProvider>
                <PageTransition>
                  {children}
                  <CartFloatingButton />
                </PageTransition>
              </ToastProvider>
              </AuthGuard>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
