// texagonui\app
import Providers from "@/utils/providers";

import "react-datepicker/dist/react-datepicker.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {Toaster as SonnerToaster} from "@/components/ui/sonner";
import {Toaster as ShadcnToaster} from "@/components/ui/toaster";
import {SessionProvider} from "next-auth/react";
import type {Metadata} from "next";
import "./globals.css";
import {NotificationProvider} from "@/components/NotificationProvider";

export const metadata: Metadata = {
  title: "Texagon Educational Platform",
  description:
    "A video conferencing and educational platform to help students learn and teachers teach.",
  generator: "Epic House",
  // Remove or comment out the icons line below
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <NotificationProvider>
          <body>
            {children}
            <SonnerToaster />
            <ShadcnToaster />
          </body>
        </NotificationProvider>
      </Providers>
    </html>
  );
}
