import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AppToaster } from "@/components/layout/app-toaster";
import { QueryProvider } from "@/components/layout/query-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Zenith Tracker",
  description: "Entrar no produto por papel",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AppToaster />
            <div className="flex min-h-full flex-col">
              <Header />
              <div className="flex flex-1 flex-col">{children}</div>
              <Footer />
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
