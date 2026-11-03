import type { Metadata, Viewport } from "next";
import "./fonts";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { currentUser } from "@/auth";
import { publicConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "Keepsake: photo albums you can print", template: "%s · Keepsake" },
  description: "Upload your photos, design a beautiful album for birthdays, weddings, vacations and more, then download a print-ready PDF or print it at home.",
};

export const viewport: Viewport = { themeColor: "#faf7f2", width: "device-width", initialScale: 1 };

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
