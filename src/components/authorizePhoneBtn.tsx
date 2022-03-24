import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

interface IProps {
  onAuthSuccess: () => void;
}

class AuthorizePhoneBtn extends Component<IProps> {
  constructor(props) {
    super(props);
  }

  compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
      v1.push('0');
    }
    while (v2.length < len) {
      v2.push('0');
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);

      if (num1 > num2) {
        return 1;
      } else if (num1 < num2) {
        return -1;
      }
    }

    return 0;
  }

  async checkVersion() {
    const version = Taro.getSystemInfoSync().SDKVersion;
    console.log(version);
    if (this.compareVersion(version, '2.21.2') >= 0) {
      return true;
    }
    await Taro.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
    });
    return false;
  }

  async getPhoneNumber(e) {
    console.log(await this.checkVersion());

    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (!userInfo?.id) {
      await Taro.showToast({
        icon: 'none',
        title: '请先登录!',
      });
      return;
    }
    const { errMsg, code = '', iv = '', encryptedData = '' } = e.detail;
    console.log(e.detail.code);
    const data = code ? { code } : { iv, encryptedData };
    if (errMsg.includes('getPhoneNumber:fail')) {
      await Taro.showToast({
        icon: 'none',
        title: '为响应疫情管控要求，团体活动需提供人员联系电话',
      });
    } else {
      await requestData({
        method: 'POST',
        api: '/wx/getPhoneNumber',
        params: {
          ...data,
          userId: userInfo.id,
        },
      })
        .then(async (res) => {
          await Taro.setStorageSync('userInfo', {
            ...userInfo,
            phoneNum: res,
            bossPhoneNum: res,
          });
          this.props.onAuthSuccess();
        })
        .catch(() => {
          Taro.showToast({
            icon: 'none',
            title: '授权获取手机号码失败，请重新点击授权',
            duration: 2000,
          });
        });
    }
  }

  render() {
    return (
      <View>
        <Button className="phone-auth-btn" openType="getPhoneNumber" onGetPhoneNumber={(e) => this.getPhoneNumber(e)}>
          {this.props.children}
        </Button>
      </View>
    );
  }
}

export default AuthorizePhoneBtn;
