const NODE_ENV = process.env.NODE_ENV;

let serverProtocol = '';
let serverDomain = '';

if (NODE_ENV !== 'development') {
  serverProtocol = 'https://';
  if (NODE_ENV === 'server') {
    serverDomain = 'wx-test.qiuchangtong.xyz';
  } else {
    serverDomain = 'wx.qiuchangtong.xyz';
  }
} else {
  serverProtocol = 'http://';
  serverDomain = 'localhost:3000';
}

export const SERVER_PROTOCOL = serverProtocol;
export const SERVER_DOMAIN = serverDomain;
// 后端 API 地址
export const SERVER_API_ROOT = `${SERVER_PROTOCOL}${SERVER_DOMAIN}/api`;
