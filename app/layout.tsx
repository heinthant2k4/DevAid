import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { ConfigProvider } from 'antd';
import { ThemeProvider, useTheme } from '../components/theme'; // Adjusted path to theme.tsx

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

// Custom component to dynamically apply Ant Design theme based on dark mode
const ThemeConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: isDarkMode ? '#69b1ff' : '#1890ff', // Example: Adjust primary color
          colorBgBase: isDarkMode ? '#000000' : '#ffffff', // Background color
          colorTextBase: isDarkMode ? '#ffffff' : '#000000', // Text color
          // Add more tokens as needed (e.g., borderRadius, fontSize)
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <ThemeConfig>
            {children}
          </ThemeConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}