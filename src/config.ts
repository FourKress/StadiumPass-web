import Taro from '@tarojs/taro';

const NODE_ENV = process.env.NODE_ENV;

let serverProtocol = '';
let serverDomain = '';

const {
  miniProgram: { envVersion },
} = Taro.getAccountInfoSync();

console.log(NODE_ENV, envVersion);

if (NODE_ENV !== 'development') {
  serverProtocol = 'https://';
  if (NODE_ENV === 'test') {
    serverDomain = 'wx-test.qiuchangtong.xyz';
  } else {
    if (envVersion === 'trial') {
      serverDomain = 'wx-test.qiuchangtong.xyz';
    } else {
      serverDomain = 'wx.qiuchangtong.xyz';
    }
  }
} else {
  serverProtocol = 'http://';
  serverDomain = 'localhost:3000';
}

export const SERVER_PROTOCOL = serverProtocol;
export const SERVER_DOMAIN = serverDomain;
export const SERVER_STATIC = '/serverStatic';
// 后端 API 地址
export const SERVER_API_ROOT = `${SERVER_PROTOCOL}${SERVER_DOMAIN}/api`;
