import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { PageTransition } from "@/components/PageTransition";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gusto mo ng mura?",
  description:
    "Hanapin at ihambing ang presyo ng mga bilihin sa mga palengke sa Metro Manila.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tl" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink font-sans text-mint">
        <TopNav />
        <PageTransition>{children}</PageTransition>
        <footer className="border-t border-forest/40 bg-ink/80 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-mint/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-mint">Gusto mo ng mura?</p>
              <p>
                Presyo ay maaaring magbago depende sa oras at tindahan. Para sa
                impormasyon lamang.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
