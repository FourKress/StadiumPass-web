import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { Provider } from 'mobx-react';

import './app.scss';

import TabBarStore from './store/tabbarStore';
import LoginStore from './store/loginStore';
import { checkForUpdate } from '@/services/updateService';

const store = {
  tabBarStore: new TabBarStore(),
  loginStore: new LoginStore(),
};

class App extends Component {
  componentWillMount() {}

  componentDidShow() {
    console.log('渲染');
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router?.params;
    const inviteId = (pageParams?.inviteId + '').toString();
    if (inviteId) {
      Taro.setStorageSync('auth', 'client');
    }
    console.log('启动参数params', pageParams);
  }

  componentDidMount() {
    // 小程序更新检测
    checkForUpdate();
  }

  render() {
    return <Provider {...store}>{this.props.children}</Provider>;
  }
}

export default App;
