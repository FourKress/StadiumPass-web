import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  payList: Array<any>;
  stadiumId: string;
  stadiumInfo: any;
  matchInfo: any;
  matchId: string;
}

class RevenueDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      payList: [1, 2, 3],
      stadiumId: '',
      matchId: '',
      stadiumInfo: {},
      matchInfo: {},
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const matchId = (pageParams.matchId + '').toString();
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.setState({
      stadiumId,
      matchId,
    });
    this.getStadiumInfo(stadiumId);
    this.getMatchInfo(matchId);
  }

  getStadiumInfo(stadiumId) {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id: stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        stadiumInfo: res,
      });
    });
  }

  getMatchInfo(match) {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id: match,
      },
    }).then((res: any) => {
      this.setState({
        matchInfo: res,
      });
    });
  }

  render() {
    const { payList, stadiumInfo, matchInfo } = this.state;

    return (
      <View className="revenue-details-page">
        <View className="top">
          <Text className="left">组队成功</Text>
          <View className="right">
            本场总收入：<Text>￥2555.00</Text>
          </View>
        </View>
        <View className="main">
          <View className="title">收入对比</View>
          <View className="signUp-list">
            <View className="sub-title">已付款</View>
            {payList.map((item, index) => {
              console.log(item);
              return (
                <View className="item">
                  <View className="index">{index + 1}</View>
                  <View className="user">
                    <Image src=""></Image>
                    <Text className="name">大手大脚凯撒奖待对对对</Text>
                  </View>
                  <View className="info">
                    <View className="money">444.00</View>
                    <View className="count">40次</View>
                  </View>
                </View>
              );
            })}
            <View className="sub-title">未付款</View>
            {payList.map((item, index) => {
              console.log(item);
              return (
                <View className="item fail">
                  <View className="index">{index + 1}</View>
                  <View className="user">
                    <Image src=""></Image>
                    <Text className="name">大手大脚凯撒奖待对对对</Text>
                  </View>
                  <View className="info">
                    <View className="money">444.00</View>
                    <View className="count">40次</View>
                  </View>
                </View>
              );
            })}
            <View className="sub-title fail">本人退款</View>
            {payList.map((item, index) => {
              console.log(item);
              return (
                <View className="item fail">
                  <View className="index">{index + 1}</View>
                  <View className="user">
                    <Image src=""></Image>
                    <Text className="name">大手大脚凯撒奖待对对对</Text>
                  </View>
                  <View className="info">
                    <View className="money">444.00</View>
                    <View className="count">40次</View>
                  </View>
                </View>
              );
            })}
          </View>
          <View className="title">场次详情</View>
          <View className="stadium-list">
            <View className="item">
              <Text className="left">本地时间</Text>
              <Text className="right">
                {matchInfo.runDate} {matchInfo.startAt}—{matchInfo.endAt}
              </Text>
            </View>
            <View className="item">
              <Text className="left">本地场次</Text>
              <Text className="right">{stadiumInfo.name}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default RevenueDetailsPage;
