declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace JSX {
  interface IntrinsicElements {
    import: React.DetailedHTMLProps<
      React.EmbedHTMLAttributes<HTMLEmbedElement>,
      HTMLEmbedElement
    >;

    'ocr-navigator': {
      /** 默认 idCard， 证书类型包含四种 身份证：idCard、驾驶证：drivingLicense、银行卡：bankCard、营业执照：businessLicense */
      certificateType?:
        | 'idCard'
        | 'drivingLicense'
        | 'bankCard'
        | 'businessLicense';
      /** 是否显示身份证的反面，默认为 true显示反面 */
      opposite?: boolean;
      /** 接口调用成功的回调函数 */
      bindonSuccess: (data: any) => void;
      children: React.ReactNode;
    };
  }
}

// @ts-ignore
declare const process: {
  env: {
    TARO_ENV:
      | 'weapp'
      | 'swan'
      | 'alipay'
      | 'h5'
      | 'rn'
      | 'tt'
      | 'quickapp'
      | 'qq'
      | 'jd';
    [key: string]: any;
  };
};
