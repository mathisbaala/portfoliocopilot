import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Portfolio Copilot - Analysez vos produits financiers en quelques secondes",
  description: "Uploadez le DIC d'un produit financier et obtenez instantanément un tableau de bord clair résumant risques, frais, horizon de détention et scénarios grâce à l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased bg-white w-full overflow-x-hidden">
        <Navbar />
        <main className="w-full py-8 sm:py-12 md:py-16">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
