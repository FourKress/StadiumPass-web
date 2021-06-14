import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtButton } from "taro-ui";

import './index.scss';

class Index extends Component {
  componentDidShow() {
    Taro.removeStorageSync('localData');
  }

  onGetUserInfo() {
    Taro.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setState({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  }

  render() {
    return (
      <View className="indexPage">
        <AtButton onClick={() => this.onGetUserInfo()}>微信快捷登陆</AtButton>
      </View>
    );
  }
}

export default Index;
