import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

interface IState {
  recordList: Array<any>;
}

class MonthlyCardDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      recordList: [{}],
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const userId = (pageParams.userId + '').toString();
    this.getRecordList(userId);
  }

  getRecordList(userId) {
    requestData({
      method: 'POST',
      api: '/monthlyCard/findAll',
      params: {
        userId,
      },
    }).then((res: any) => {
      this.setState({
        recordList: res,
      });
    });
  }

  render() {
    const { recordList } = this.state;

    return (
      <View className="monthlyCard-details">
        <View className="list">
          {recordList.length ? (
            recordList.map((item) => {
              return (
                <View className="item">
                  <View className="row">
                    <Text className="label">购买时间：</Text>
                    <Text className="text">{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </View>
                  <View className="row">
                    <Text className="label">有效期：</Text>
                    <Text className="text">
                      {dayjs(item.validPeriodStart).format('YYYY-MM-DD')} -{' '}
                      {dayjs(item.validPeriodEnd).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                  <View className="row">
                    <Text className="label">购买费用：</Text>
                    <Text className="text">￥{item?.stadium?.monthlyCardPrice}</Text>
                  </View>
                  <View className="row">
                    <Text className="label">月卡状态：</Text>
                    <Text className="text success fail">{item.validFlag ? '有效' : '无效'}</Text>
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

export default MonthlyCardDetailsPage;
