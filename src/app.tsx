import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { Provider } from 'mobx-react';

import './app.scss';

import TabBarStore from './store/tabbarStore';
import LoginStore from './store/loginStore';

const store = {
  tabBarStore: new TabBarStore(),
  loginStore: new LoginStore(),
};

class App extends Component {
  componentWillMount() {
    const params = Taro.getCurrentInstance().router?.params;
    console.log('启动参数params', params);
  }

  componentDidShow() {
    console.log('渲染');
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
    updateManager.onUpdateReady(async function () {
      await Taro.showModal({
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
    updateManager.onUpdateFailed(async function () {
      // 新的版本下载失败
      await Taro.showModal({
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
