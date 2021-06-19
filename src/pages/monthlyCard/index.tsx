import React, { Component } from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  cardList: Array<any>;
}

class MonthlyCardPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      cardList: [],
    };
  }

  componentDidShow() {
    this.getCardList();
  }

  getCardList() {
    requestData({
      method: 'POST',
      api: '/monthlyCard/list',
      params: {
        userId: Taro.getStorageSync('userInfo').id,
      },
    }).then((data: any) => {
      this.setState({
        cardList: data,
      });
      console.log(data);
    });
  }

  render() {
    const { cardList } = this.state;

    return (
      <View className="card-page">
        <View className="tips">已开通：{cardList.length}张</View>
        <View className="list">
          {cardList.length ? (
            cardList.map(() => {
              return (
                <View className="item">
                  <View className="left">
                    <Image src="" className="icon"></Image>
                  </View>
                  <View className="right">
                    <View className="row">
                      <View className="label">价格</View>：￥150.00/月
                    </View>
                    <View className="row">
                      <View className="label">开通场馆</View>：奥斯卡大家说的
                    </View>
                    <View className="row">
                      <View className="label">有效期</View>
                      ：2011-01-01—2011-11-11
                    </View>
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

export default MonthlyCardPage;
