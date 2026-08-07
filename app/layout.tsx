import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://postia.cloud"),
  title: {
    default: "PostIA — Publie sur tous tes réseaux automatiquement",
    template: "%s | PostIA",
  },
  description:
    "PostIA crée et publie tes posts sur TikTok, Instagram, Facebook et LinkedIn automatiquement, chaque jour, sans que tu lèves le petit doigt.",
  applicationName: "PostIA",
  keywords: [
    "publication automatique réseaux sociaux",
    "générateur de posts",
    "planification Instagram",
    "planification TikTok",
    "community management automatisé",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://postia.cloud",
    siteName: "PostIA",
    locale: "fr_FR",
    title: "PostIA — Publie sur tous tes réseaux automatiquement",
    description:
      "Crée et publie tes posts sur TikTok, Instagram, Facebook et LinkedIn automatiquement, chaque jour.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostIA — Publie sur tous tes réseaux automatiquement",
    description:
      "Crée et publie tes posts sur TikTok, Instagram, Facebook et LinkedIn automatiquement, chaque jour.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
