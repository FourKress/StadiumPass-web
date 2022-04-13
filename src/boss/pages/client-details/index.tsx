import React, { Component } from 'react';
import { Image, Text, View } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';
import Taro from '@tarojs/taro';
// import dayjs from 'dayjs';

interface IState {
  userId: string;
  userInfo: any;
}

class ClientDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userInfo: {},
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const userId = (pageParams.userId + '').toString();
    this.getUserInfo(userId);
    this.setState({ userId });
  }

  getUserInfo(userId) {
    requestData({
      method: 'GET',
      api: '/user/findOneById',
      params: {
        userId,
      },
    }).then((res: any) => {
      this.setState({
        userInfo: res,
      });
    });
  }

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
    const { userInfo } = this.state;

    return (
      <View className="client-detail-page">
        <View className="top">
          <Image className="avatar" src={userInfo.avatarUrl}></Image>
          <View className="name">{userInfo.nickName}</View>
          {userInfo.monthlyCardCount > 0 && <View className="tag"></View>}
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
