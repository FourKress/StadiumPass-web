import { Config } from '@tarojs/taro';

const config: Config = {
  pages: [
    'client/pages/waitStart/index',
    'pages/load/index',
    'pages/userCenter/index',
    'boss/pages/fail-stadium/index',
    'boss/pages/match/index',
    'boss/pages/match-edit/index',
    'boss/pages/match-details/index',
    'boss/pages/revenue/index',
    'boss/pages/revenue-details/index',
    'boss/pages/stadium-details/index',
    'boss/pages/statistics/index',
    'boss/pages/myClient/index',
    'client/pages/monthlyCard/index',
    'client/pages/myWatch/index',
    'client/pages/order/index',
    'client/pages/orderPay/index',
    'client/pages/share/index',
    'client/pages/stadium/index',
    'client/pages/community/index',
  ],
  tabBar: {
    custom: true,
    color: '#93A7B6',
    selectedColor: '#0080FF',
    list: [
      {
        pagePath: 'boss/pages/revenue/index',
        text: '营收',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home.png',
      },
      {
        pagePath: 'boss/pages/match/index',
        text: '场次',
        iconPath: 'assets/icons/phone.png',
        selectedIconPath: 'assets/icons/phone.png',
      },
      {
        pagePath: 'client/pages/community/index',
        text: '圈子',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home.png',
      },
      {
        pagePath: 'client/pages/waitStart/index',
        text: '报名',
        iconPath: 'assets/icons/phone.png',
        selectedIconPath: 'assets/icons/phone.png',
      },
      {
        pagePath: 'pages/userCenter/index',
        text: '我的',
        iconPath: 'assets/icons/me.png',
        selectedIconPath: 'assets/icons/me.png',
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
