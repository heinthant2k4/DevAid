import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#ff4d4f', // Red theme for relief fund
    fontFamily: 'var(--font-geist-sans)',
    borderRadius: 4,
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff', // White background
      borderRadius: 4,
      boxShadow: 'none', // Remove default shadow
    },
    Button: {
      colorPrimary: '#ff4d4f',
      borderRadius: 4,
    },
  },
};

export default theme;