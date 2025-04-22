import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@omc/ui";
import { ThemeProvider, ThemeToggle } from "@omc/ui/theme";
import { Toaster } from "@omc/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.DOPPLER_ENVIRONMENT === "prd"
      ? "https://snatched-ai-ljnck.ondigitalocean.app/"
      : "http://localhost:3000",
  ),
  title: "Snatched AI - Your Personal Body Transformation Assistant",
  description:
    "Visualise, achieve, and track your ideal body shape through personalised AI plans combining workouts, nutrition, body analysis, and styling tips.",
  generator: "v0.dev",
  openGraph: {
    title: "Snatched AI - Your Personal Body Transformation Assistant",
    description:
      "Visualise, achieve, and track your ideal body shape through personalised AI plans combining workouts, nutrition, body analysis, and styling tips.",
    url: "https://snatched-ai-ljnck.ondigitalocean.app/",
    siteName: "Snatched AI",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
