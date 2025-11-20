import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Portfolio Copilot - Analysez vos produits financiers en quelques secondes",
  description: "Uploadez le DIC d'un produit financier et obtenez instantanément un tableau de bord clair résumant risques, frais, horizon de détention et scénarios grâce à l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen antialiased bg-white w-full overflow-x-hidden font-sans">
        <Navbar />
        <main className="w-full">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
