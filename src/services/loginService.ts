import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

const login = () => {
  return new Promise(async (resolve, reject) => {
    await Taro.showLoading({
      title: '快捷登陆中',
    });
    Taro.login()
      .then((res) => {
        if (res.code) {
          // 发起网络请求;
          return getOpenId(res.code);
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      })
      .then((res: any) => {
        Taro.setStorageSync('sessionKey', res.session_key);
        Taro.setStorageSync('openId', res.openid);
        return checkFirstLogin(res.openid);
      })
      .then((res: any) => {
        if (res) {
          return sendLogin(res.openId);
        } else {
          console.log('第一次登陆');
          Taro.hideLoading();
          resolve(false);
        }
      })
      .then((res: any) => {
        return saveUserInfo(res);
      })
      .then((res) => {
        Taro.hideLoading();
        resolve(res);
      })
      .catch((err) => {
        console.log('登录失败！' + err);
        Taro.hideLoading();
        reject();
      });
  });
};

const getOpenId = (code) => {
  return requestData({
    method: 'GET',
    api: '/wx/code2Session',
    params: {
      code,
    },
  });
};

const checkFirstLogin = (openId) => {
  return requestData({
    method: 'GET',
    api: '/user/findOneByOpenId',
    params: {
      openId,
    },
  })
    .then((res) => {
      return Promise.resolve(res);
    })
    .catch(() => {
      return Promise.reject(false);
    });
};

const sendLogin = (openId, userInfo = {}) => {
  return requestData({
    method: 'POST',
    api: '/auth/login',
    params: {
      openId,
      ...userInfo,
    },
  });
};

const saveUserInfo = (res) => {
  Taro.setStorageSync('token', res.token);
  Taro.setStorageSync('authIds', res.authIds);
  Taro.setStorageSync('authStadiumIds', res.authStadiumIds);
  Taro.setStorageSync('userInfo', res.userInfo);
  return res.userInfo;
};

const handleAuthorize = (isLogin = true) => {
  return new Promise((resolve, reject) => {
    Taro.getUserProfile({
      desc: `用于${isLogin ? '完善' : '更新'}会员资料`, // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang: 'zh_CN',
    })
      .then(async (res) => {
        const openId = Taro.getStorageSync('openId');
        await Taro.showLoading({
          title: `${isLogin ? '快捷登陆中' : '更新中'}`,
        });
        return sendLogin(openId, res.userInfo);
      })
      .then((res) => {
        Taro.hideLoading();
        return saveUserInfo(res);
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        Taro.hideLoading();
        reject();
      });
  });
};

const checkLogin = async () => {
  const token = Taro.getStorageSync('token');
  if (!token) {
    await Taro.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000,
    });
  }
  return token;
};

export { login, handleAuthorize, checkLogin, sendLogin, saveUserInfo };
