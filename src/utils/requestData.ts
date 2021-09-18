import Taro, { request } from '@tarojs/taro';
import responseHandler from '@/utils/responseHandler';
import { ReqData, ResError } from '@/interfaces/common';
import { SERVER_API_ROOT } from '../config';

/**
 * 请求后端数据封装
 * @param data 请求参数
 * @returns 直接返回data或者错误对象
 */
export default function requestData<T = void>(data: ReqData) {
  // 缓存requestData参数
  const { api, params = {}, method = 'GET', config } = data;

  return new Promise<T>((resolve: (data: any) => void, reject: (err: ResError) => void) => {
    const completeApi = SERVER_API_ROOT + api;
    // Taro.showToast({ icon: 'none', duration: 0, title: '请求中...' });
    const mergeData = Object.assign({}, params);
    let requestParams: Record<string, any> | string = {};

    if (config?.serialize) {
      requestParams = JSON.stringify(mergeData);
    } else {
      requestParams = mergeData;
    }

    const options: request.Option = {
      url: completeApi,
      method,
      header: {
        'Content-Type': 'application/json',
        Authorization: Taro.getStorageSync('token'),
      },
      data: requestParams,
    };

    // 发送请求 返回promise对象
    request(options)
      .then(responseHandler())
      .then((res) => {
        Taro.hideLoading();
        console.log('请求地址=', options.url, '请求参数=', requestParams, '返回数据', res);
        resolve(res);
      })
      .catch((err) => {
        // Taro.hideLoading();
        console.log('请求地址=', options.url, '请求参数=', requestParams, '接口返回全部错误==', err);
        Taro.showToast({
          icon: 'none',
          title: err.message,
        });
        reject(err);
      });
  });
}
