import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

class AuthorizePhoneBtn extends Component {
  constructor(props) {
    super(props);
  }

  async getPhoneNumber(e) {
    const { errMsg, iv, encryptedData } = e.detail;
    if (errMsg.includes('getPhoneNumber:fail')) {
      if (errMsg.includes('user cancel')) {
        await Taro.showToast({
          icon: 'none',
          title: '请不要重复点击、以免取消微信授权',
        });
      } else {
        await Taro.showToast({
          icon: 'none',
          title: '允许授权将获得更好的服务',
        });
      }
    } else {
      await requestData({
        method: 'POST',
        api: 'wx/getPhoneNum',
        params: {
          code: '',
          iv,
          encryptedData,
        },
      })
        .then((res) => {
          console.log(res);
        })
        .catch(() => {});
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
