import React, { Component } from 'react';
import { Text, View, Picker, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';

const typeList = [
  {
    label: '按报名次数',
    value: '0',
  },
  {
    label: '按报名时间',
    value: '1',
  },
  {
    label: '按月卡',
    value: '2',
  },
];

interface IState {
  clientList: any[];
  clientTotal: number;
  monthlyCardCount: number;
  type: string;
}

class MyClientPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
      clientTotal: 0,
      monthlyCardCount: 0,
      type: '0',
    };
  }

  componentDidShow() {
    this.getClientList(this.state.type);
  }

  getClientList(type) {
    requestData({
      method: 'GET',
      api: '/order/userList',
      params: {
        type,
      },
    }).then((res: any) => {
      this.setState({
        clientList: res,
      });
    });
  }

  handleSelectChange(event) {
    const index = event.detail.value;
    const value = typeList[index].value;
    this.setState({
      type: value,
    });
    this.getClientList(value);
  }

  render() {
    const { clientList, clientTotal, monthlyCardCount, type } = this.state;

    return (
      <View className="my-client-page">
        <View className="search-panel">
          <View className="left">
            <Text>
              共{clientTotal}位顾客，{monthlyCardCount}位月卡顾客
            </Text>
          </View>
          <View className="right">
            <Picker
              mode="selector"
              range={typeList}
              rangeKey="label"
              onChange={(event) => this.handleSelectChange(event)}
            >
              <Text className="type">{typeList.find((d) => d.value === type)?.label}</Text>
              <AtIcon value="chevron-down" size="20" color="#101010"></AtIcon>
            </Picker>
          </View>
        </View>
        {clientList.length > 0 ? (
          <View className="list-warp">
            <View className="scroll-warp">
              {clientList.map((item, index) => {
                console.log(item);
                return (
                  <View className="item">
                    <View className="index">{index + 1}</View>
                    <View className="img">
                      <Image src=""></Image>
                    </View>
                    <View className="info">
                      <View className="name">水电费舒服舒服</View>
                      <View className="tag"></View>
                    </View>
                    <View className="detail">
                      <View className="tips">所发生的</View>
                      <View className="time">最近：24243</View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="not-data" style="margin-top: 16px">
            暂无数据
          </View>
        )}
      </View>
    );
  }
}

export default MyClientPage;
