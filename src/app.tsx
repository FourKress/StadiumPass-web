import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { Provider } from 'mobx-react';

import './app.scss';

import TabBarStore from './store/tabbarStore';

import * as LoginService from './services/loginService';

const store = {
  tabBarStore: new TabBarStore(),
};

class App extends Component {
  async componentWillMount() {
    const params = Taro.getCurrentInstance().router?.params;
    console.log('启动参数params', params);

    let userInfo = Taro.getStorageSync('userInfo');
    if (userInfo) {
      userInfo = await LoginService.login();
    }

    const isBoss = userInfo?.bossId || false;
    if (isBoss) {
      // Taro.reLaunch({
      //   url: `/pages/revenue/index`,
      // });
    }
  }

  componentDidShow() {
    console.log('渲染');
    Taro.setStorageSync('stadiumId', '613337e62a06f63968225cf8');
  }

  componentDidMount() {
    // 小程序更新检测
    this.updateManager();
  }
  updateManager() {
    //自动更新的设置
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate, '无版本更新');
    });
    updateManager.onUpdateReady(function () {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      Taro.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false,
      });
    });
  }

  render() {
    return <Provider {...store}>{this.props.children}</Provider>;
  }
}

export default App;
