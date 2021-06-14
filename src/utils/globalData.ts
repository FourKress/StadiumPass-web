const globalData = {};
/**
 * 设置全局变量
 */
export function setGlobalData(key: string, val) {
  globalData[key] = val;
}
export function getGlobalData<T>(key: string): T {
  return globalData[key];
}
export function removeGlobalData(key: string) {
  return (globalData[key] = undefined);
}
