import React, { Component } from 'react';
import { Text, View, Picker, Image } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';

import './index.scss';

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
];

interface IState {
  clientList: any[];
  allClientList: any[];
  type: string;
  clientTypeKey: number;
  clientTypes: any[];
  keywords: string;
}

class MyClientPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
      allClientList: [],
      type: '0',
      clientTypeKey: 0,
      clientTypes,
      keywords: '',
    };
  }

  componentDidShow() {
    this.getClientList(this.state.type, this.state.keywords);
  }

  getClientList(type, keywords) {
    const params: any = {
      type,
    };
    if (keywords) {
      params.keywords = keywords;
    }
    requestData({
      method: 'GET',
      api: '/order/userList',
      params: {
        ...params,
      },
    }).then((res: any) => {
      const clientTypes = this.state.clientTypes;
      clientTypes[0].value = res.length;
      clientTypes[1].value = res.filter((d) => d.isMonthlyCard).length;
      this.setState({
        allClientList: res,
        clientTypes: [...clientTypes],
      });
      this.serCurrentClientList(res, this.state.clientTypeKey);
    });
  }

  serCurrentClientList(list, key) {
    let clientList = list;
    if (key === 1) {
      clientList = list.filter((d) => d.isMonthlyCard);
    }
    this.setState({
      clientList,
    });
  }

  handleSelectChange(event) {
    const index = event.detail.value;
    const value = typeList[index].value;
    this.setState({
      type: value,
    });
    this.getClientList(value, this.state.keywords);
  }

  handleClientTypeChange(type) {
    const key = type.key;
    this.setState({
      clientTypeKey: key,
    });
    this.serCurrentClientList(this.state.allClientList, key);
  }

  setSearchValue(value) {
    this.setState(
      {
        keywords: value,
      },
      () => {
        if (!value) {
          this.handleSearchChange();
        }
      }
    );
  }

  handleSearchChange() {
    const { type, keywords } = this.state;
    this.getClientList(type, keywords);
  }

  async jumpClientDetail(user) {
    await Taro.navigateTo({
      url: `/boss/pages/client-details/index?userId=${user.id}`,
    });
  }

  render() {
    const { clientList, type, clientTypeKey, keywords } = this.state;

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
              <AtIcon value="chevron-down" size="14" color="#101010"></AtIcon>
            </Picker>
          </View>
        </View>

        <View className="search-row">
          <View className="wrap">
            <AtIcon className="icon" value="search" size="18" color="#C7C7CC"></AtIcon>
            <AtInput
              name="search"
              type="text"
              placeholder="搜索昵称、电话"
              placeholderClass="search-input"
              clear
              value={keywords}
              onChange={(value) => this.setSearchValue(value)}
              onBlur={() => this.handleSearchChange()}
            />
          </View>
        </View>

        {clientList.length > 0 ? (
          <View className="list-warp">
            <View className="scroll-warp">
              {clientList.map((item, index) => {
                return (
                  <View className="item" onClick={() => this.jumpClientDetail(item)}>
                    <View className="index">{index + 1}</View>
                    <View className="img">
                      <Image src={item.avatarUrl}></Image>
                    </View>
                    <View className="info">
                      <View className="name">{item.nickName}</View>
                      {item.isMonthlyCard && <View className="tag"></View>}
                    </View>
                    <View className="detail">
                      <View className="tips">{item.count}</View>
                      {/*<View className="time">最近：{dayjs(item.lastTime).format('YYYY-MM-DD')}</View>*/}
                      <View className="time">成功报名次数</View>
                    </View>
                    <AtIcon value="chevron-right" size="20" color="#999"></AtIcon>
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
