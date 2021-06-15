import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtTabBar } from "taro-ui"
// import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';

interface IState {
  orderList: Array<any>;
  tabValue: number;
}

class OrderPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      tabValue: 0,
    };
  }

  componentDidShow() {
    console.log(123)
  }

  handleTabClick(value) {
    this.setState({
      tabValue: value,
    });
  }

  render() {
    const { tabValue } = this.state;

    return (
      <View className="order-page">
        <AtTabBar
          tabList={[
            { title: '待付款', text: 8 },
            { title: '待开始', text: 8 },
            { title: '全部订单', text: 8 }
          ]}
          onClick={(value) => this.handleTabClick(value)}
          current={tabValue}
        />

        <View className={'list'}>
          <View className={'item'}>
            <View className={'top'}>
              <Text className={'name'}>立长大大打算</Text>
              <Text className={'status'}>待付款</Text>
            </View>
            <View className={'info'}>
              <View className={'row'}>2021.06.09 / 18:00-20:00 / 2小时</View>
              <View className={'row'}>足球 / 5v5 / 一号场 / 2人</View>
            </View>
            <View className={'footer'}>
              <Text className={'date'}>2021.01.01 12:22:22</Text>
              <Text className={'money'}>总价：￥50.00</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default OrderPage;
