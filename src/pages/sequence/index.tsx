import React, { Component } from 'react';
import { View } from '@tarojs/components';
// import Taro from '@tarojs/taro';
// import { AtButton } from 'taro-ui';
// import requestData from '@/utils/requestData';

import './index.scss';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

@inject('tabBarStore')
@observer
class Index extends Component<InjectStoreProps, {}> {
  constructor(props) {
    super(props);
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }
  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
  }

  render() {
    return <View className="indexPage">321</View>;
  }
}

export default Index;
