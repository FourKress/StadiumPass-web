import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
// import {  } from "taro-ui"
// import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';

interface IState {
  orderList: Array<any>;
}

class OrderPayPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
    };
  }

  componentDidShow() {

  }

  render() {
    return (
      <View className="pay-page">
        <View className="top-bar">
          <View className="tips">为提升组队成功率，请在倒计时结束前支付！</View>
          <View className="date">
            <View className="block">2</View>
            <View className="block">3</View>
            <View className="line">:</View>
            <View className="block">1</View>
            <View className="block">9</View>
          </View>
        </View>

        <View className="panel">
          <View className="info">
            <View className="top">场次信息</View>
            <View className="row">
              <Text className="label">场馆</Text>
              <Text className="text">可能荆防颗粒时代峻峰</Text>
            </View>
            <View className="row">
              <Text className="label">场地</Text>
              <Text className="text">足球 / 5V5 / 一号场</Text>
            </View>
            <View className="row">
              <Text className="label">时间</Text>
              <Text className="text">今天 06.09 / 18:00-20:00 / 2小时</Text>
            </View>
            <View className="row">
              <Text className="label">人数</Text>
              <Text className="text">2人</Text>
            </View>
            <View className="row">
              <Text className="label">金额</Text>
              <Text className="text">￥25.00/人，共50.00</Text>
            </View>
          </View>
        </View>

        <View className="panel">
          <View className="pay">
            <View className="top">场次信息</View>
            <View className="row">
              <Text className="icon"></Text>
              <Text className="label">微信支付</Text>
              <Text className="money">￥50</Text>
              <Text className="icon"></Text>
            </View>
            <View className="row">
              <Text className="icon"></Text>
              <Text className="label">
                {/*<Text>场地月卡</Text>*/}
                {/*<Text className="text">(每场仅可免费1个名额)</Text>*/}
              </Text>
              <Text className="money">
                <Text>￥50</Text>
                <Text className="text">(开通并使用月卡)</Text>
              </Text>
              <Text className="icon"></Text>
            </View>
            {/*<View className="tips">月卡有效期：2021.06.09-2021.07.08</View>*/}
            <View className="tips">月卡有效期内，不限次数免费订场！仅需¥150/月！</View>
          </View>
        </View>

        <View className="details">
          <View>
            <View>注意事项：</View>
            <View>1、报名人数不足最低开赛标准时，即组队失败。订单将自动退款,款项将在1个工作日内按原路全额退回。</View>
            <View>2、关于用户主动取消订单的退款规则距开场小于1小时,无法退款;距开场大于1小时,小于2小时,退款80%;距开场大于2小时,可全额退款。</View>
            <View>3、场地月卡可随时无责取消订单,但不支持退款。</View>
          </View>
        </View>

        <View className="pay-btn">
          <View className="btn">立即支付 ￥50.00</View>
        </View>
      </View>
    );
  }
}

export default OrderPayPage;
