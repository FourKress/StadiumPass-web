import { Config } from '@tarojs/taro';

const config: Config = {
  pages: [
    'pages/stadium/index',
    'pages/me/index',
    'pages/monthlyCard/index',
    'pages/index/index',
    'pages/orderPay/index',
    'pages/myWatch/index',
    'pages/order/index',
    'pages/login/index',
  ],
  plugins: {
    ocrPlugin: {
      version: '3.0.6',
      provider: 'wx4418e3e031e551be',
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '球场通',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff',
  },
};

export default config;
