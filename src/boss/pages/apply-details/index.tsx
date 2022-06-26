import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtTabBar } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

interface IState {
  applyList: Array<any>;
  orderInfo: any;
  tabValue: number;
  userId: string;
  bossId: any;
}

class ApplyDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      applyList: [],
      orderInfo: {
        success: 0,
        error: 0,
      },
      tabValue: 0,
      userId: '',
      bossId: '',
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const userId = (pageParams.userId + '').toString();
    const bossId = (pageParams.bossId + '').toString();

    this.setState(
      {
        userId,
        bossId,
      },
      () => {
        this.getApplyList();
      }
    );
  }

  getApplyList() {
    requestData({
      method: 'POST',
      api: '/order/infoByUserId',
      params: {
        userId: this.state.userId,
        bossId: this.state.bossId,
      },
    }).then((res: any) => {
      const tabValue = this.state.tabValue;
      let applyList;
      if (tabValue === 0) {
        applyList = res.all;
      } else if (tabValue === 1) {
        applyList = res.success;
      } else {
        applyList = res.error;
      }
      this.setState({
        orderInfo: res,
        applyList,
      });
    });
  }

  handleTabClick(value) {
    this.setState({
      tabValue: value,
    });
    this.getApplyList();
  }

  render() {
    const { tabValue, applyList, orderInfo } = this.state;

    return (
      <View className="apply-page">
        <AtTabBar
          tabList={[
            { title: '全部', text: orderInfo.success?.length + orderInfo.error?.length || undefined },
            { title: '成功', text: orderInfo.success?.length || undefined },
            { title: '失败', text: orderInfo.error?.length || undefined },
          ]}
          onClick={(value) => this.handleTabClick(value)}
          current={tabValue}
        />

        <View className="list">
          {applyList.length ? (
            applyList.map((item) => {
              return (
                <View className="item">
                  <View className="row">
                    <Text className="label">报名时间：</Text>
                    <Text className="text">{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名场次：</Text>
                    <Text className="text">
                      {dayjs(item?.matchId?.runDate).format('YYYY-MM-DD')} / {item?.matchId?.startAt}-
                      {item?.matchId?.endAt} / 一号场地
                    </Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名费用：</Text>
                    <Text className="text">￥{item.payAmount}</Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名状态：</Text>
                    <Text
                      className={
                        item.status === 2 ? 'text success' : item.refundType === 1 ? 'text fail' : 'text refund'
                      }
                    >
                      {item.status === 2
                        ? '组队成功'
                        : item.refundType === 1
                        ? `组队失败：已退款￥${item.refundAmount}`
                        : `手动退款：已退款￥${item.refundAmount}`}
                    </Text>
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

export default ApplyDetailsPage;
