import React, { Component } from 'react';
import { View } from '@tarojs/components';

import './index.scss';
import Taro from '@tarojs/taro';

class About extends Component {
  constructor(props) {
    super(props);
  }

  componentDidShow() {}

  async jump() {
    await Taro.navigateTo({
      url: '/pages/suggestions/index',
    });
  }

  render() {
    return (
      <View className="about-page">
        <View className="list">
          <View>求队官方微信：qiudui6666（官方微信/商务合作）</View>
          <View>版本：v1.1.2</View>
        </View>

        <View className="btn" onClick={() => this.jump()}>
          投诉建议
        </View>
      </View>
    );
  }
}

export default About;
