import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AppProps } from 'next/app';

const theme = extendTheme({
  fonts: {
    body: 'var(--font-jetb rains-mono), monospace',
  },
  colors: {
    blue: {
      500: '#1890ff',
      600: '#40a9ff',
    },
    green: {
      500: '#389e0d',
    },
    gray: {
      600: '#666666',
      800: '#1a1a1a',
    },
    red: {
      500: '#ff4d4f',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;