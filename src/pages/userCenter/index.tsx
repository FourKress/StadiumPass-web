import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';

import BossMePage from '@/src/boss/pages/bossMe';
import MePage from '@/src/client/pages/me';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

@inject('tabBarStore')
@observer
class UserCenter extends Component<InjectStoreProps> {
  constructor(props) {
    super(props);
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(2);
  }

  render() {
    const isBoss = Taro.getStorageSync('auth') === 'boss';

    return isBoss ? <BossMePage /> : <MePage />;
  }
}

export default UserCenter;
