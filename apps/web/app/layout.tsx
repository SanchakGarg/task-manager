import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/SessionProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Get Things Done",
    template: "%s | TaskFlow",
  },
  description:
    "A beautiful task manager with Google Drive integration, smart reminders, and real-time sync across all your devices.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "TaskFlow",
    description: "Get things done with style",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#E84E10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "2px solid #0A0A0A",
                borderRadius: "12px",
                boxShadow: "4px 4px 0px #0A0A0A",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 600,
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
