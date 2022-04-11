import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import { AtTabBar } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
// import dayjs from 'dayjs';

interface IApplyCount {
  successCount: number;
  errorCount: number;
  allCount: number;
}

interface IState {
  applyList: Array<any>;
  applyCount: IApplyCount;
  tabValue: number;
}

class ApplyDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      applyList: [{}],
      applyCount: {
        successCount: 0,
        errorCount: 0,
        allCount: 0,
      },
      tabValue: 0,
    };
  }

  componentDidShow() {
    this.getApplyCount();
    // @ts-ignore
    const index = Number(Taro.getCurrentInstance().router.params.index);
    this.getApplyList(index);
    this.setState({
      tabValue: index,
    });
  }

  getApplyCount() {
    requestData({
      method: 'GET',
      api: '/order/listCount',
    }).then((res: any) => {
      this.setState({
        applyCount: res,
      });
    });
  }

  getApplyList(status) {
    requestData({
      method: 'POST',
      api: '/order/listByStatus',
      params: {
        status: status === 2 ? undefined : status,
      },
    }).then((res: any) => {
      this.setState({
        applyList: res,
      });
    });
  }

  handleTabClick(value) {
    this.setState({
      tabValue: value,
    });
    this.getApplyCount();
    this.getApplyList(value);
  }

  render() {
    const { tabValue, applyCount, applyList } = this.state;

    return (
      <View className="apply-page">
        <AtTabBar
          tabList={[
            { title: '全部', text: applyCount.allCount || undefined },
            { title: '成功', text: applyCount.successCount || undefined },
            { title: '失败', text: applyCount.errorCount || undefined },
          ]}
          onClick={(value) => this.handleTabClick(value)}
          current={tabValue}
        />

        <View className="list">
          {applyList.length ? (
            applyList.map((item) => {
              console.log(item);
              return (
                <View className="item">
                  <View className="row">
                    <Text className="label">报名时间：</Text>
                    <Text className="text">2022-22-22 12:22:22</Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名场次：</Text>
                    <Text className="text">2022-22-22 / 10:00-21:00 / 一号场地</Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名费用：</Text>
                    <Text className="text">￥25.00</Text>
                  </View>
                  <View className="row">
                    <Text className="label">报名状态：</Text>
                    <Text className="text success fail refund">组队成功</Text>
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
