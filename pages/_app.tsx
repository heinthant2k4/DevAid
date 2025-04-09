import "antd/dist/reset.css"; // Import Ant Design styles
import "../styles/globals.css"; // Import global styles
import { AppProps } from "next/app";
// _app.tsx or App.tsx
import { ThemeProvider } from '../components/theme';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;