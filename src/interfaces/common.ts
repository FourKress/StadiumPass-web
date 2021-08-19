/** 请求参数 */
export interface ReqData {
  /** 后端API */
  api: string;
  /**常规请求服务 root 登录相关 login */
  server?: 'root' | 'login';
  /** 请求参数*/
  params?: { [key: string]: any };
  method?: 'POST' | 'GET';
  /** 请求配置 */
  config?: {
    /** 是否加上token, false表示不加，1000表示普通, 1001表示登录*/
    setToken?: false | 1000 | 1001;
    token?: string;
    /** 是否是否吧参数处理成formData形式 */
    serialize?: boolean;
    /**  API的版本号 */
    apiVersion?: number;
    /** 是否传递Authorization*/
    isAuth?: boolean;
  };
  responseType?: string;
}

/** 错误返回 */
export interface ResError {
  code: number;
  succeed: false;
  msg?: string;
  error?: any;
  data?: any;
}
