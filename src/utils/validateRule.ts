/**
 * 表单校验规则-正则
 * */

export const validateRegular = {
  phone: /^1\d{10}$/,
  idNo: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
  name: /^[\u4E00-\u9FA5]{2,10}$/,
  chinese: /^[\u4e00-\u9fa5]+$/,
  identificationNumber: /^(([a-z]+[0-9]+)|([0-9]+[a-z]+))[a-z0-9]*$/i,
  sendTo: /^1\d{10}$/,
  tel: /^0\d{2,3}-\d{7,8}$/,
  telPhone: /^0\d{2,3}-\d{7,8}$/,
  number: /^\d+(\.\d+)?$/,
  decimal: /^\d+(.\d+)?$/,
  numberLetter: /^[a-zA-Z0-9]*$/,
  companyName: /^[a-zA-Z.《》（）\u4e00-\u9fa5]*$/,
  email: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/, //邮箱
};
