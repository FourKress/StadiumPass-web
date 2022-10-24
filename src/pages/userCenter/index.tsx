import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';

import BossMePage from '@/src/boss/pages/bossMe';
import MePage from '@/src/client/pages/me';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IState {
  renderKey: any;
}

@inject('tabBarStore')
@observer
class UserCenter extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      renderKey: Date.now(),
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.setState({
      renderKey: Date.now(),
    });
    this.inject.tabBarStore.setSelected(2);
  }

  render() {
    const isBoss = Taro.getStorageSync('auth') === 'boss';
    const { renderKey } = this.state;
    console.log(isBoss, renderKey);

    return isBoss ? <BossMePage key={renderKey} /> : <MePage key={renderKey} />;
  }
}

export default UserCenter;
