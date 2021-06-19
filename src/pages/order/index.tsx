import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtTabBar } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';
import requestData from '@/utils/requestData';

interface IOrderCount {
  payCount: number;
  startCount: number;
  allCount: number;
}

interface IState {
  orderList: Array<any>;
  orderCount: IOrderCount;
  tabValue: number;
}

class OrderPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      orderCount: {
        payCount: 0,
        startCount: 0,
        allCount: 0,
      },
      tabValue: 0,
    };
  }

  componentDidShow() {
    this.getOrderCount();
    // @ts-ignore
    const index = Number(Taro.getCurrentInstance().router.params.index);
    this.getStatusOrderList(index);
    this.setState({
      tabValue: index,
    });
  }

  getOrderCount() {
    requestData({
      method: 'GET',
      api: '/order/listCount',
      params: {
        userId: Taro.getStorageSync('userInfo').id,
      },
    }).then((res: any) => {
      this.setState({
        orderCount: res,
      });
    });
  }

  getStatusOrderList(status) {
    requestData({
      method: 'POST',
      api: '/order/listByStatus',
      params: {
        userId: Taro.getStorageSync('userInfo').id,
        status,
      },
    }).then((res: any) => {
      this.setState({
        orderList: res,
      });
    });
  }

  handleTabClick(value) {
    this.setState({
      tabValue: value,
    });
    this.getStatusOrderList(value);
  }

  render() {
    const { tabValue, orderCount, orderList } = this.state;

    return (
      <View className="order-page">
        <AtTabBar
          tabList={[
            { title: '待付款', text: orderCount.payCount || undefined },
            { title: '待开始', text: orderCount.startCount || undefined },
            { title: '全部订单', text: orderCount.allCount || undefined },
          ]}
          onClick={(value) => this.handleTabClick(value)}
          current={tabValue}
        />

        <View className="list">
          {orderList.length ? (
            orderList.map(() => {
              return (
                <View className="item">
                  <View className="top">
                    <Text className="name">立长大大打算</Text>
                    <Text className="status">待付款</Text>
                  </View>
                  <View className="info">
                    <View className="row">
                      2021.06.09 / 18:00-20:00 / 2小时
                    </View>
                    <View className="row">足球 / 5v5 / 一号场 / 2人</View>
                  </View>
                  <View className="footer">
                    <Text className="date">2021.01.01 12:22:22</Text>
                    <Text className="money">总价：￥50.00</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="not-data">暂无数据</View>
          )}
        </View>
      </View>
    );
  }
}

export default OrderPage;
