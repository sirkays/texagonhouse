// import type {Metadata} from "next";
// import {GeistSans} from "geist/font/sans";
// import {GeistMono} from "geist/font/mono";
// import "./globals.css";
import Providers from "@/utils/providers";

// export const metadata: Metadata = {
//   title: "Texagon Educational Platform",
//   description:
//     "An educational platform to help students learn and teachers teach.",
//   generator: "Epic House",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <style>{`
// html {
//   font-family: ${GeistSans.style.fontFamily};
//   --font-sans: ${GeistSans.variable};
//   --font-mono: ${GeistMono.variable};
// }
//         `}</style>
//       </head>
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

import "react-datepicker/dist/react-datepicker.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {Toaster} from "@/components/ui/sonner";
import {SessionProvider} from "next-auth/react";
import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texagon Educational Platform",
  description:
    "A video conferencing and educational platform to help students learn and teachers teach.",
  generator: "Epic House",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        {/* <SessionProvider> */}
        <body>
          {children}
          <Toaster />
        </body>
        {/* </SessionProvider> */}
      </Providers>
    </html>
    //{" "}
  );
}
