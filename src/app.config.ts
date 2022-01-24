import { Config } from '@tarojs/taro';

const config: Config = {
  pages: [
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
    'client/pages/community/index',
    'client/pages/monthlyCard/index',
    'client/pages/myWatch/index',
    'client/pages/order/index',
    'client/pages/orderPay/index',
    'client/pages/share/index',
    'client/pages/stadium/index',
    'client/pages/waitStart/index',
  ],
  tabBar: {
    custom: true,
    color: '#93A7B6',
    selectedColor: '#0080FF',
    list: [
      {
        pagePath: 'boss/pages/revenue/index',
        text: '营收',
        iconPath: 'assets/icons/bar-1.png',
        selectedIconPath: 'assets/icons/bar-2.png',
      },
      {
        pagePath: 'boss/pages/match/index',
        text: '场次',
        iconPath: 'assets/icons/bar-3.png',
        selectedIconPath: 'assets/icons/bar-4.png',
      },
      {
        pagePath: 'client/pages/community/index',
        text: '圈子',
        iconPath: 'assets/icons/bar-7.png',
        selectedIconPath: 'assets/icons/bar-8.png',
      },
      {
        pagePath: 'client/pages/waitStart/index',
        text: '',
        iconPath: 'assets/icons/bar-9.png',
        selectedIconPath: 'assets/icons/bar-9.png',
      },
      {
        pagePath: 'pages/userCenter/index',
        text: '我的',
        iconPath: 'assets/icons/bar-11.png',
        selectedIconPath: 'assets/icons/bar-11.png',
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '授权获取位置信息，获得更好的体验',
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '求队',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff',
  },
};

export default config;
