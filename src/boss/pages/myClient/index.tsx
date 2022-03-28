import React, { Component } from 'react';
import { Text, View, Picker, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';
import dayjs from 'dayjs';

const typeList = [
  {
    label: '踢球次数',
    value: '0',
  },
  {
    label: '报名时间',
    value: '1',
  },
];

const clientTypes = [
  {
    label: '全部',
    value: 0,
    key: 0,
  },
  {
    label: '月卡',
    value: 0,
    key: 1,
  },
  {
    label: '黑名单',
    value: 0,
    key: 2,
  },
];

interface IState {
  clientList: any[];
  type: string;
  clientTypeKey: number;
  clientTypes: any[];
}

class MyClientPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
      type: '0',
      clientTypeKey: 0,
      clientTypes,
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
      const clientTypes = this.state.clientTypes;
      clientTypes[0].value = res.length;
      clientTypes[1].value = res.filter((d) => d.isMonthlyCard).length;
      this.setState({
        clientList: res,
        clientTypes: [...clientTypes],
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

  handleClientTypeChange(type) {
    const key = type.key;
    this.setState({
      clientTypeKey: key,
    });
    if (key === 1) {
      this.getClientList(2);
    }
  }

  render() {
    const { clientList, type, clientTypeKey } = this.state;

    return (
      <View className="my-client-page">
        <View className="search-panel">
          <View className="left">
            {clientTypes.map((type) => {
              return (
                <View
                  className={clientTypeKey === type.key ? 'btn active' : 'btn'}
                  onClick={() => this.handleClientTypeChange(type)}
                >
                  <Text>{type.label}</Text>
                  <Text className="count">（{type.value}）</Text>
                </View>
              );
            })}
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
                return (
                  <View className="item">
                    <View className="index">{index + 1}</View>
                    <View className="img">
                      <Image src={item.avatarUrl}></Image>
                    </View>
                    <View className="info">
                      <View className="name">{item.nickName}</View>
                      {item.isMonthlyCard && <View className="tag"></View>}
                    </View>
                    <View className="detail">
                      <View className="tips">共报名{item.count}次</View>
                      <View className="time">最近：{dayjs(item.lastTime).format('YYYY-MM-DD')}</View>
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
