import React, { Component } from 'react';
import { Image, Text, View } from '@tarojs/components';
// import { AtIcon, AtInput } from 'taro-ui';
// import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';
import { AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
// import dayjs from 'dayjs';

interface IState {
  clientList: any[];
}

class ClientDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
    };
  }

  componentDidShow() {}

  async jumpApplyDetails() {
    await Taro.navigateTo({
      url: `/boss/pages/apply-details/index`,
    });
  }

  async jumpMonthlyCardDetails() {
    await Taro.navigateTo({
      url: `/boss/pages/monthlyCard-details/index`,
    });
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
              name="phoneNum"
              title="联系电话"
              type="text"
              placeholder="请输入联系电话"
              value=""
              disabled
              onChange={() => {}}
            />
          </View>
        </View>

        <View className="title-row">报名信息</View>
        <View className="row-panel">
          <View className="wrap border" onClick={() => this.jumpApplyDetails()}>
            <Text className="at-input__title">报名</Text>
            <View className="info">
              <View className="mark">成功54次，失败44次</View>
              <View className="time">最近报名：2022-22-22</View>
            </View>
            <AtIcon value="chevron-right" size="20" color="#D8D8D8"></AtIcon>
          </View>
          <View className="wrap border" onClick={() => this.jumpMonthlyCardDetails()}>
            <Text className="at-input__title">月卡</Text>
            <View className="info">
              <View className="mark">购买44次</View>
              <View className="time">有效期至：2022-22-22</View>
            </View>
            <AtIcon value="chevron-right" size="20" color="#D8D8D8"></AtIcon>
          </View>
        </View>
      </View>
    );
  }
}

export default ClientDetailsPage;
