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
import {getBrandConfig} from "@/lib/brand";

const currentBrand = getBrandConfig();

export const metadata: Metadata = {
  title: {
    default: currentBrand.metaTitle,
    template: `%s | ${currentBrand.fullName}`,
  },
  description: currentBrand.metaDescription,
  generator: currentBrand.fullName,
  icons: {
    icon: currentBrand.favicon,
    shortcut: currentBrand.favicon,
    apple: currentBrand.favicon,
  },
  openGraph: {
    title: currentBrand.metaTitle,
    description: currentBrand.metaDescription,
    siteName: currentBrand.fullName,
    images: [{ url: currentBrand.logo }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeBrand = getBrandConfig();

  return (
    <html lang="en" data-brand={activeBrand.id}>
      <Providers>
        <NotificationProvider>
          <body data-brand={activeBrand.id}>
            {children}
            <SonnerToaster />
            <ShadcnToaster />
          </body>
        </NotificationProvider>
      </Providers>
    </html>
  );
}

