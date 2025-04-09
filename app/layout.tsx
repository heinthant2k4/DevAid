import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; // Changed import
import "../styles/globals.css";
import { ConfigProvider } from 'antd';
import theme from './theme';

// Configure JetBrains Mono font
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Specify weights you need
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
      <body
        className={`${jetBrainsMono.variable} antialiased`}
      >
        <ConfigProvider theme={theme}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}