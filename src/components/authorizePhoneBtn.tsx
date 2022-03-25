import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

interface IProps {
  onAuthSuccess: () => void;
}

interface IState {
  versionFlag: boolean;
}

class AuthorizePhoneBtn extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      versionFlag: true,
    };
  }

  componentDidMount() {
    // const versionFlag = this.checkVersion();
    this.setState({
      versionFlag: true,
    });
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

  checkVersion() {
    const version = Taro.getSystemInfoSync().SDKVersion;
    if (this.compareVersion(version, '2.21.2') >= 0) {
      return true;
    }
    return false;
  }

  async versionUpdate() {
    await Taro.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
    });
  }

  async handleError() {
    await Taro.showToast({
      icon: 'none',
      title: '授权获取手机号码失败，请重新点击授权',
      duration: 2000,
    });
  }

  async getPhoneNumber(e) {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (!userInfo?.id) {
      await Taro.showToast({
        icon: 'none',
        title: '请先登录!',
      });
      return;
    }
    const { errMsg, code = '', iv = '', encryptedData = '' } = e.detail;
    const sessionKey = Taro.getStorageSync('sessionKey');
    const data = code ? { code } : { sessionKey, iv, encryptedData };
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
        .then(async (res: any) => {
          if (!res) {
            await this.handleError();
            return;
          }
          await Taro.setStorageSync('userInfo', {
            ...userInfo,
            phoneNum: res,
            bossPhoneNum: res,
          });
          this.props.onAuthSuccess();
        })
        .catch(() => {
          this.handleError();
        });
    }
  }

  render() {
    const { versionFlag } = this.state;

    return (
      <View>
        {versionFlag ? (
          <Button className="phone-auth-btn" openType="getPhoneNumber" onGetPhoneNumber={(e) => this.getPhoneNumber(e)}>
            {this.props.children}
          </Button>
        ) : (
          <Button className="phone-auth-btn" onClick={() => this.versionUpdate()}>
            {this.props.children}
          </Button>
        )}
      </View>
    );
  }
}

export default AuthorizePhoneBtn;
