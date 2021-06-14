import Taro from '@tarojs/taro';

/**  检查是否登录 */
export default function checkAuth(): Promise<boolean> {
  // 获取当前路由
  const token: string = Taro.getStorageSync('token');

  if (!token) {
    return Promise.reject(false);
  }
  return Promise.resolve(true);
}
