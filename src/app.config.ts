import { Config } from '@tarojs/taro';

const config: Config = {
  pages: [
    'pages/revenue/index',
    'pages/revenue-details/index',
    'pages/statistics/index',
    'pages/bossMe/index',
    'pages/stadium/index',
    'pages/orderPay/index',
    'pages/me/index',
    'pages/monthlyCard/index',
    'pages/sequence/index',
    'pages/myWatch/index',
    'pages/order/index',
    'pages/login/index',
    'pages/share/index',
  ],
  plugins: {
    ocrPlugin: {
      version: '3.0.6',
      provider: 'wx4418e3e031e551be',
    },
  },
  tabBar: {
    custom: true,
    color: '#93A7B6',
    selectedColor: '#0080FF',
    list: [
      {
        pagePath: 'pages/revenue/index',
        text: '营收',
        iconPath: '',
        selectedIconPath: '',
      },
      {
        pagePath: 'pages/sequence/index',
        text: '场次',
        iconPath: '',
        selectedIconPath: '',
      },
      {
        pagePath: 'pages/bossMe/index',
        text: '我的',
        iconPath: '',
        selectedIconPath: '',
      },
    ],
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
