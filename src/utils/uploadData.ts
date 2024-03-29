import Taro, { uploadFile } from '@tarojs/taro';
import { SERVER_API_ROOT } from '../config';

/**
 * 上传文件
 */
export default function uploadData<T = void>(params, type = 'stadium') {
  return new Promise<T>((resolve: (data: any) => void, reject: (err) => void) => {
    const map = {
      stadium: '/stadium/uploadFile',
      suggestions: '/suggestions/uploadFile',
    };
    const completeApi = SERVER_API_ROOT + map[type];

    const requestParams = Object.assign({});

    const options: uploadFile.Option = {
      ...params,
      header: {
        'Content-Type': 'multipart/form-data',
        Authorization: Taro.getStorageSync('token'),
      },
      formData: requestParams,
      url: completeApi,
    };

    console.log('上传options', options);

    // 发送请求 返回promise对象
    uploadFile(options)
      .then((response) => {
        const jsonData: { code: number; data: any } = JSON.parse(response.data);

        if (jsonData.code !== 10000) {
          return Promise.reject(jsonData);
        }

        return jsonData.data;
      })
      .then(resolve)
      .catch((err) => {
        console.log('接口错误：', { options: options, data: err });
        const codeList = ['10000100', '10000102'];
        console.log(3333);
        if (codeList.includes(err.code)) {
          Taro.clearStorageSync();
          // Taro.switchTab({
          //   url: '../index/index',
          // });
        }
        Taro.showToast({
          icon: 'none',
          title: err.message,
        });
        reject(err);
      });
  });
}
