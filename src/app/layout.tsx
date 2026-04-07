import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Adding Metadata type for better DX
export const metadata: Metadata = {
  title: "Lost and Found",
  description: "A website that helps users post lost and found items",
};

// Defining the Interface for props
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
