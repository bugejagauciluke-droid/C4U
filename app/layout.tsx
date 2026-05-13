import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { readSiteConfig } from "@/lib/site-config";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = readSiteConfig();
  const title = `${branding.appName} — ${branding.tagline}`;
  const description = branding.tagline;
  return {
    title,
    description,
    metadataBase: new URL("https://c4u.app"),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: branding.appName,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { branding } = readSiteConfig();
  return (
    <Providers>
      <html lang="en" className={`${geist.variable} antialiased`}>
        <body className="min-h-screen flex flex-col">
          <Navbar appName={branding.appName} />
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </Providers>
  );
}
