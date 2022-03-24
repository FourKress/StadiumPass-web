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

  async getPhoneNumber(e) {
    console.log(e.detail.code);
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (!userInfo?.id) {
      await Taro.showToast({
        icon: 'none',
        title: '请先登录!',
      });
      return;
    }
    const { errMsg, code } = e.detail;
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
          code,
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
          });
        });
    }
  }

  render() {
    return (
      <View>
        <Button className="phoneBtn" openType="getPhoneNumber" onGetPhoneNumber={(e) => this.getPhoneNumber(e)}>
          {this.props.children}
        </Button>
      </View>
    );
  }
}

export default AuthorizePhoneBtn;
