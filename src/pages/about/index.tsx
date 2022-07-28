import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtButton } from 'taro-ui';

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
          <View>
            官方微信：<Text className="wechaty">qiudui6666</Text>
          </View>
          <View>
            版本：<Text className="wechaty">v1.1.2</Text>
          </View>
          <View className="btn" onClick={() => this.jump()}>
            <AtButton size="small" type="primary">
              投诉建议
            </AtButton>
          </View>
        </View>

        <View className="footer">【合作请微信联系】</View>
      </View>
    );
  }
}

export default About;
