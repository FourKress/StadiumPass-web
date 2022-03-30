import React, { Component } from 'react';
import { Image, Text, View } from '@tarojs/components';
// import { AtIcon, AtInput } from 'taro-ui';
// import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';
import { AtInput } from 'taro-ui';
// import dayjs from 'dayjs';

interface IState {
  clientList: any[];
}

class MyClientPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
    };
  }

  componentDidShow() {}

  handleChange(value, key) {
    console.log(value, key);
  }

  render() {
    return (
      <View className="client-detail-page">
        <View className="top">
          <Image className="avatar" src=""></Image>
          <View className="name">白龙马不是马</View>
          <View className="tag"></View>
        </View>

        <View className="title-row">个人信息</View>

        <View className="row-panel">
          <View className="wrap">
            <AtInput
              name="name"
              title="姓名"
              type="text"
              placeholder="请输入姓名"
              value=""
              onChange={(value) => this.handleChange(value, 'name')}
            />
          </View>
        </View>
        <View className="row-panel">
          <View className="wrap">
            <AtInput
              name="phoneNum"
              title="联系电话"
              type="text"
              placeholder="请输入联系电话"
              value=""
              onChange={(value) => this.handleChange(value, 'phoneNum')}
            />
          </View>
        </View>

        <View className="title-row">报名信息</View>
        <View className="row-panel">
          <View className="wrap">
            <Text>报名</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default MyClientPage;
