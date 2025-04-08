import "antd/dist/reset.css"; // Import Ant Design styles
import "../styles/globals.css"; // Import global styles
import { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;