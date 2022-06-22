import React, { Component } from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

import * as LoginService from '@/services/loginService';
import { SERVER_DOMAIN, SERVER_PROTOCOL } from '@/src/config';

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

    setTimeout(async () => {
      // @ts-ignore
      const path = Taro.getCurrentInstance().router?.path;
      const clientPath = '/client/pages/waitStart/index';
      if (path === clientPath) return;
      let userInfo = Taro.getStorageSync('userInfo');
      const isClient = Taro.getStorageSync('auth') === 'client';
      if (userInfo && isClient) {
        userInfo = await LoginService.login();
      }
      const authIds = Taro.getStorageSync('authIds');
      const isBoss = (userInfo?.bossId && userInfo?.phoneNum) || authIds?.length || false;
      let url;
      if (isBoss) {
        url = '/boss/pages/revenue/index';
        await Taro.setStorageSync('auth', 'boss');
      } else {
        url = clientPath;
        await Taro.setStorageSync('auth', 'client');
      }

      Taro.hideToast();

      setTimeout(() => {
        Taro.reLaunch({
          url,
        });
      }, 200);
    }, 1000);
  }

  render() {
    return (
      <View className="load-page">
        <Image src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}/images/load.jpg`} className="load-bg" />
      </View>
    );
  }
}

export default LoadPage;
