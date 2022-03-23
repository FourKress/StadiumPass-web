import { ResError } from 'src/interfaces/common';
import Taro, { request } from '@tarojs/taro';
import * as LoginService from '../services/loginService';
import { getGlobalData, setGlobalData } from '@/utils/globalData';

/**
 * 处理返回值
 * @returns {(response: request.Promised<any>) => Promise<any>} 后端返回的response对象，微信小程序的数据结构 解析 返回data或者错误对象
 */
export default function responseHandler() {
  return (
    response: request.SuccessCallbackResult<{
      code: number;
      message: string;
      data: any;
      succeed: boolean;
    }>
  ) =>
    new Promise(async (resolve: (data: any) => void, reject: (data: ResError) => void) => {
      if (response.statusCode !== 200) {
        Taro.hideLoading();
        if (response.statusCode === 401) {
          Taro.removeStorageSync('userInfo');
          Taro.removeStorageSync('openId');
          let tips = '当前还未登录，请立即登录。';
          if (Taro.getStorageSync('token')) {
            tips = '当前登录已失效，请重新登录。';
          }
          Taro.removeStorageSync('token');
          await Taro.showModal({
            title: '提示',
            content: tips,
            confirmText: '去登录',
            showCancel: false,
            success: async (res) => {
              if (res.confirm) {
                const ctx: any = getGlobalData('pageCtx');
                if (ctx?.props) {
                  const userInfo: any = await LoginService.login();
                  ctx.props.loginStore.setUserInfo(userInfo?.id);
                  setGlobalData('pageCtx', '');
                } else {
                  await Taro.reLaunch({
                    url: '/pages/userCenter/index',
                  });
                }
              }
            },
          });
          return;
        }
        await Taro.showToast({
          icon: 'none',
          title: response.data.message || '网络异常，请检查网络',
        });
        return reject({
          code: response.statusCode,
          data: response.data,
          succeed: false,
        });
      }

      // 服务器返回状态
      switch (response.data.code) {
        case 10000: // 请求成功
          resolve(response.data.data);
          break;
        default:
          // 其他报错
          const codeList = [10000100, 10000102];
          if (codeList.includes(response.data.code)) {
            Taro.clearStorageSync();
          }
          reject({
            ...response.data,
            msg: response.data.message,
            succeed: false,
          });
          break;
      }
    });
}
