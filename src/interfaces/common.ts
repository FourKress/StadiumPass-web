import { Component, ValidationMap } from 'react';

/**
 * 组件类类型
 */
export interface ComponentClass<P = {}> {
  new (...args: any[]): Component<P, {}>;
  propTypes?: ValidationMap<P>;
  defaultProps?: Partial<P>;
  displayName?: string;
}

/**
 * 分页请求数据接口
 **/
export type IPagerParams<T = {}> = {
  /** 每页数量 */
  size: number;
  /** 当前页码 */
  current: number;
} & T;

/**
 * 分页返回数据接口
 **/
export interface IPager {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 总条数  */
  total: number;
}

/** 带分页的列表数据类型 */
export interface IPageList<T = any> extends IPager {
  /** 列表数据 */
  records: T[];
}

/** 带分页功能的api请求函数 */
export interface IPageFunc<P extends Record<string, any> = {}, R = any> {
  (params: IPagerParams<P>): Promise<IPageList<R>>;
}

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

/**
 * 文件信息
 */
export interface FileData {
  /** 文件ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件源地址 */
  url: string;
  /** 文件预览地址 */
  previewUrl: string;
  /** 文件下载地址 */
  downloadUrl: string;
  /** 文件类型 */
  mimeType: string;
}

export type BooleanFlagEnum = {
  /** 1-是，0-否 */
  label: string;
  /** 1-是，0-否 */
  value: 1 | 0;
};

/** 添加发票抬头参数 */
export type HeadVO = {
  /** 抬头id */
  id?: string;
  /** 公司名称 */
  companyName: string;
  /** 公司税号 */
  identificationNumber: string;
  /** 公司地址 */
  companyAddress?: string;
  /** 公司开户银行 */
  bankName?: string;
  /** 银行账户 */
  bankAccount?: string;
  /** 联系电话 */
  mobile?: string;
  /** 是否枚举 */
  defaultFlag: number;
};
/** 发票抬头 */
export type HeadVOList = {
  /** 抬头id */
  id: string;
  /** 公司名称 */
  companyName: string;
  /** 公司税号 */
  identificationNumber: string;
  /** 公司地址 */
  companyAddress?: string;
  /** 公司开户银行 */
  bankName?: string;
  /** 银行账户 */
  bankAccount?: string;
  /** 联系电话 */
  mobile?: string;
  /** 是否枚举 */
  defaultFlag: BooleanFlagEnum;
};

/** 开票人 */
export type DrawerVO = {
  /** 开票人id */
  id?: string;
  /** 真实姓名 */
  name: string;
  /** 身份证号 */
  idNo: string;
  /** 联系电话 */
  mobile: string;
  /** 身份证正面照 */
  idNoPhotoFront: string;
  /** 身份证反面照 */
  idNoPhotoBack: string;
  /** 启用状态 */
  status?: EnableFlagEnum;
  /** 来源类型 */
  fromType?: FromTypeEnum;
  /** 推荐人名 */
  fromName?: string;
  /** 推荐人id */
  fromId?: number;
  updateTime?: string;
  /**是否可选 */
  flag?: boolean;
};

/** 启用状态 */
export type EnableFlagEnum = {
  /** 枚举名（1-启用，0-禁用） */
  label: string;
  /** 枚举名（1-启用，0-禁用） */
  value: 1 | 0;
};

export type FromTypeEnum = {
  /** 枚举名（1-自然流量，2-员工，3-渠道） */
  label: string;
  /** 枚举名（1-自然流量，2-员工，3-渠道） */
  value: 1 | 2 | 3;
};

/** 地址列表 */
export type AddressVOList = {
  /** 地址id */
  id: string;
  /** 收件人姓名 */
  receiverName: string;
  /** 联系电话 */
  mobile: string;
  /** 所在地区区县名 */
  districtName: string;
  /** 所在地区区县Code */
  districtCode: string;
  /** 所在城市名 */
  cityName: string;
  /** 所在城市Code */
  cityCode: string;
  /** 所在省份名 */
  provinceName: string;
  /** 所在省份Code */
  provinceCode: string;
  /** 详细地址 */
  detailedAddress: string;
  /**是否默认 */
  defaultFlag: BooleanFlagEnum;
};
/** 地址 */
export type AddressVO = {
  /** 地址id */
  id?: string;
  /** 收件人姓名 */
  receiverName: string;
  /** 联系电话 */
  mobile: string;
  /** 所在地区区县名 */
  districtName: string;
  /** 所在地区区县Code */
  districtCode: string;
  /** 所在城市名 */
  cityName: string;
  /** 所在城市Code */
  cityCode: string;
  /** 所在省份名 */
  provinceName: string;
  /** 所在省份Code */
  provinceCode: string;
  /** 详细地址 */
  detailedAddress: string;
  /**是否默认 */
  defaultFlag: number;
};
/**
 * 地区级联
 */
export type AddressPicker = {
  /** code*/
  code: string;
  /**名称 */
  name: string;
};

/**
 * 地区级联
 */
export type AreaItem = {
  /** code*/
  code: string;
  /**是否是叶子节点 */
  isLeaf: boolean;
  /**名称 */
  name: string;
  /**名称 */
  label: string;
  /** code */
  value: string;
  /** 子节点 */
  children?: AreaItem[];
};
/** 文案配置 */
export type ConfigText = {
  /**首页文案 */
  textHome: {
    /**标题 */
    title: string;
  };
  /** tabbar导航 */
  textTabBar: string[];
  /** 开票表单 */
  textInvoiceForm: {
    /**开票 */
    pageNav: string;
    /** 园区 */
    park: {
      text: string;
      tipText: string;
    };
    /** 品目类别 */
    category: string;
    /** 发票明细 */
    invoiceDetailList: {
      /**标题 */
      title: string;
      /** 开票总额 */
      totalTitle: string;
      /** 开票内容 */
      cont: string;
      /** 规格型号 */
      size: string;
      /** 计量单位 */
      unit: string;
      /** 数量 */
      num: string;
      /** 单价(元) */
      price: string;
      /** 开票金额(元) */
      money: string;
    };
    /** 发票类型 */
    invoiceType: {
      /**标题 */
      title: string;
      /** 增值税普通发票 */
      cont: string;
    };
    /** 付款凭证 */
    payFiles: string;
    businessFiles: string;
    /**业务凭证 */
    /** 用户协议 */
    userAgreement: {
      /**标题 */
      title: string;
      /** 委托协议 */
      pageNav: string;
    };
    /** 费用明细 */
    moneyDetails: {
      /**标题 费用明细 */
      title: string;
      /** 增值税 */
      zengzhishui: string;
      /** 个人所得税 */
      suodeshui: string;
      /** 地方教育附加 */
      localEdu: string;
      /** 教育附加 */
      edu: string;
      /** 城市维护建设税 */
      city: string;
      /** 印花税 */
      stampTax: string;
      /**服务费 */
      serviceFee: string;
      /**费用合计 */
      moneyTotal: string;
    };
  };
  /**发票抬头 */
  textInvoiceHead: {
    /**标题 -发票抬头 */
    title: string;
    /** 选择发票抬头 */
    pageNav: string;
    /** 添加发票抬头 */
    addText: string;
    /**公司名称 */
    compName: string;
    /**公司税号 */
    compNumber: string;
    /**公司地址 */
    compAddr: string;
    /**公司开户行 */
    compBank: string;
    /**银行账号 */
    compBankNumber: string;
    /**联系电话 */
    tel: string;
    /** 设为默认抬头 */
    default: string;
    /**每次会默认填写该抬头信息 */
    defaultTip: string;
    /**删除发票抬头 */
    deleteText: string;
  };
  /**开票人 */
  textDrawer: {
    /**标题 -开票人*/
    title: string;
    /** 选择开票人 */
    pageNav: string;
    /** 添加开票人 */
    addText: string;
    /**国家公务人员、军人、企业法人、股东不能申请开票。 */
    listTip: string;
    /**拍照/上传身份证正反面照 */
    idCardTitle: string;
    /**拍摄须知 */
    cameraTip: string;
    /** 完善申请人身份信息 */
    formTitle: string;
    /**真实姓名 */
    username: string;
    /**身份证号 */
    idNumber: string;
    /**删除开票人 */
    deleteText: string;
    /**联系电话 */
    tel: string;
  };
  /** 收票地址 */
  textInvoiceAddress: {
    /**收票地址 */
    title: string;
    /** 选择收票地址 */
    pageNav: string;
    /** 添加收票地址 */
    addText: string;
    /**收件人 */
    user: string;
    /** 收件地址 */
    addr: string;
    /**详细地址 */
    addressInfo: string;
    /**联系电话 */
    tel: string;
    /** 设为默认抬头 */
    default: string;
    /**每次会默认填写该抬头信息 */
    defaultTip: string;
    /**删除收票地址 */
    deleteText: string;
  };
  /**个人中心 */
  textMePage: {
    /**我的发票 */
    invoice: string;
    /**开票人 */
    drawer: string;
    /**发票抬头 */
    invoiceHead: string;
    /** 我的地址 */
    address: string;
  };
};
