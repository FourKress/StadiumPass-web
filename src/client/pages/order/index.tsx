import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtTabBar } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

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

const colorMap = {
  0: '#FF2000',
  5: '#FF2000',
  1: '#0092FF',
  7: '#0092FF',
  4: '#1A1E22',
  3: '#1A1E22',
  2: '#93A7B6',
  6: '#ccc',
};

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
        status: status === 2 ? undefined : status,
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
    this.getOrderCount();
    this.getStatusOrderList(value);
  }

  async handleOrderJump(order) {
    const { status, id, stadiumId, matchId } = order;
    if ([0, 1, 7].includes(status)) {
      let url = '';
      if (status === 0) {
        url = `../orderPay/index?orderId=${id}`;
      } else if ([1, 7].includes(status)) {
        url = `../stadium/index?stadiumId=${stadiumId}&orderId=${id}&matchId=${matchId}`;
      }
      await Taro.navigateTo({
        url,
      });
    }
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
            orderList.map((item) => {
              return (
                <View className="item" onClick={() => this.handleOrderJump(item)}>
                  <View className="top">
                    <Text className="name">{item.stadiumName}</Text>
                    <Text style={{ color: colorMap[item.status] }} className="status">
                      {[1, 7].includes(item.status) && <Text>组队成功 </Text>}
                      {[3, 4].includes(item.status) &&
                        (item.refundType === 1 ? <Text>组队失败 </Text> : <Text>主动取消 </Text>)}
                      {item.statusName}
                    </Text>
                  </View>
                  <View className="info">
                    <View className="row">
                      {item.runDate} / {item.runAt} / {item.duration}小时
                    </View>
                    <View className="row">
                      足球 / {item.unit} / {item.spaceName} / {item.personCount}人
                    </View>
                  </View>
                  <View className="footer">
                    <Text className="date">{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                    <Text className="money">总价：￥{item.totalPrice}</Text>
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
