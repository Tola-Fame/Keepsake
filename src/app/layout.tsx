import type { Metadata, Viewport } from "next";
import "./fonts";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { currentUser } from "@/auth";
import { publicConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "Keepsake: your trips, printed as books", template: "%s · Keepsake" },
  description: "Turn your travel photos into a beautiful book. Add photos from your phone or Google Photos, we lay out every day, then print it and ship it to your door.",
};

export const viewport: Viewport = { themeColor: "#fbf7f3", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <AppProvider config={publicConfig()} user={user}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
