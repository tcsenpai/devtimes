import type { Metadata } from "next";
import { Playfair_Display, Old_Standard_TT, UnifrakturCook } from "next/font/google";
import "./globals.css";
import { ErrorFilter } from "@/components/ErrorFilter";
import { TimeOfDay } from "@/components/TimeOfDay";
import { SecretToast } from "@/components/SecretToast";
import { SecretDetector } from "@/components/SecretDetector";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
});

const oldStandard = Old_Standard_TT({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const blackletter = UnifrakturCook({
  subsets: ["latin"],
  variable: "--font-masthead",
  weight: "700",
});

export const metadata: Metadata = {
  title: "The Dev Times — All the Code That's Fit to Print",
  description:
    "A newspaper for developers. Daily.dev posts, set in classic broadsheet type, served with the rustle of turning pages.",
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:3939"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${oldStandard.variable} ${blackletter.variable} newsprint`}
      >
        <ErrorFilter />
        <TimeOfDay />
        <SecretDetector />
        <SecretToast />
        {children}
      </body>
    </html>
  );
}
