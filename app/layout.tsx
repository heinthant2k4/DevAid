import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// Configure JetBrains Mono font
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Extend Chakra UI theme to match your custom styles (if needed)
const theme = extendTheme({
  fonts: {
    body: "var(--font-jetbrains-mono), monospace",
    heading: "var(--font-jetbrains-mono), monospace",
  },
  colors: {
    blue: {
      500: "#1890ff", // Primary blue from your previous theme
    },
    red: {
      500: "#ff4d4f", // Error red from your previous theme
    },
  },
});

export const metadata: Metadata = {
  title: "Myanmar Earthquake Relief Fund | Help Rebuild Lives",
  description: "Support earthquake-affected communities in Myanmar. Your donation can help provide emergency relief, shelter, and rebuild lives.",
  keywords: "Myanmar, earthquake relief, charity, donation, emergency aid, humanitarian help",
  openGraph: {
    title: "Myanmar Earthquake Relief Fund",
    description: "Support earthquake-affected communities in Myanmar. Your donation can help provide emergency relief, shelter, and rebuild lives.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}