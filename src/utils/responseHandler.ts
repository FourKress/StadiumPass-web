import { ResError } from 'src/interfaces/common';
import Taro, { request } from '@tarojs/taro';

/**
 * 处理返回值
 * @returns {(response: request.Promised<any>) => Promise<any>} 后端返回的response对象，微信小程序的数据结构 解析 返回data或者错误对象
 */
export default function responseHandler() {
  return (
    response: request.SuccessCallbackResult<{
      code: string;
      msg: string;
      data: any;
      succeed: boolean;
    }>
  ) =>
    new Promise(
      (resolve: (data: any) => void, reject: (data: ResError) => void) => {
        // 服务器返回状态
        /**服务器异常报错 */
        if (response.statusCode !== 200) {
          Taro.showToast({ icon: 'none', title: '网络异常，请检查网络' });
          return reject({
            code: response.statusCode + '',
            data: response.data,
            succeed: false,
          });
        }

        // 服务器返回状态
        switch (response.data.code) {
          case '0': // 请求成功
            resolve(response.data.data);
            break;
          default:
            // 其他报错
            const codeList = ['10000100', '10000102'];
            console.log(3333);
            if (codeList.includes(response.data.code)) {
              Taro.clearStorageSync();
              // Taro.switchTab({
              //   url: '../index/index',
              // });
            }
            reject({
              ...response.data,
              msg: response.data.msg,
              succeed: false,
            });
            break;
        }
      }
    );
}
