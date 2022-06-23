import Taro from '@tarojs/taro';

export const checkPath = (path) => {
  // @ts-ignore
  const currentPath = Taro.getCurrentInstance().router?.path;
  return path === currentPath;
};
