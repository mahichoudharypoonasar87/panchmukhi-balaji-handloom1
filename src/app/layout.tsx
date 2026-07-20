import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import MaintenanceGate from "@/components/layout/MaintenanceGate";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://panchmukhibalajihandloom.com"
  ),
  title: {
    default: "Panchmukhi Balaji Handloom Poonasar | Premium Rajasthani Handloom",
    template: "%s | Panchmukhi Balaji Handloom",
  },
  description:
    "Discover authentic Rajasthani handloom sarees, fabrics, and textiles at Panchmukhi Balaji Handloom, Poonasar. Premium quality, traditional craftsmanship, modern designs.",
  keywords: [
    "handloom saree", "Rajasthani saree", "Poonasar handloom",
    "cotton saree", "silk saree", "traditional saree", "Balaji handloom",
    "Panchmukhi Balaji", "buy saree online", "Rajasthan textiles",
  ],
  authors: [{ name: "Panchmukhi Balaji Handloom" }],
  creator: "Panchmukhi Balaji Handloom",
  publisher: "Panchmukhi Balaji Handloom",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Panchmukhi Balaji Handloom",
    title: "Panchmukhi Balaji Handloom Poonasar | Premium Rajasthani Handloom",
    description:
      "Discover authentic Rajasthani handloom sarees, fabrics and textiles. Traditional craftsmanship meets modern elegance.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Panchmukhi Balaji Handloom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panchmukhi Balaji Handloom Poonasar",
    description: "Premium Rajasthani Handloom Sarees & Textiles",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0500" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <SiteSettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  <MaintenanceGate>{children}</MaintenanceGate>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: "#1A0A00",
                        color: "#FFF8EE",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        borderRadius: "12px",
                        fontFamily: "Outfit, system-ui, sans-serif",
                        fontSize: "14px",
                      },
                      success: {
                        iconTheme: { primary: "#D4AF37", secondary: "#1A0A00" },
                      },
                      error: {
                        iconTheme: { primary: "#8B1A1A", secondary: "#FFF8EE" },
                      },
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
