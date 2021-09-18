import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

import * as LoginService from '@/services/loginService';

interface IState {}

class LoadPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidShow() {
    await Taro.showToast({
      icon: 'loading',
      title: '拼命加载中...',
    });
    let userInfo = Taro.getStorageSync('userInfo');
    if (userInfo) {
      userInfo = await LoginService.login();
    }

    const isBoss = userInfo?.bossId || false;
    let url;
    let auth;
    if (isBoss) {
      url = '/boss/pages/revenue/index';
      auth = 'boss';
    } else {
      url = '/client/pages/waitStart/index';
      auth = 'client';
    }

    Taro.setStorageSync('auth', auth);
    Taro.hideToast();
    await Taro.reLaunch({
      url,
    });
  }

  render() {
    return <View></View>;
  }
}

export default LoadPage;
