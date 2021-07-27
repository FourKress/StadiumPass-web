import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
// import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';
// import requestData from '@/utils/requestData';

import './index.scss';

class Index extends Component {
  componentDidShow() {}

  showTotal() {
    console.log(1);
  }

  render() {
    return (
      <View className="indexPage">
        <View className="top">
          <View className="left">
            <View className="title">今日总收入</View>
            <View className="total">13212.00</View>
          </View>
          <View className="right" onClick={() => this.showTotal()}>
            <Text>统计</Text>
            <AtIcon value="chevron-right" size="20" color="#fff"></AtIcon>
          </View>
        </View>
      </View>
    );
  }
}

export default Index;
