import React, { Component } from 'react';
import { View, Image } from '@tarojs/components';
// import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import Taro from '@tarojs/taro';

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
    }).then((data: any) => {
      this.setState({
        cardList: data,
      });
      console.log(data);
    });
  }

  jumpStadium(stadiumId) {
    Taro.navigateTo({
      url: `/client/pages/stadium/index?stadiumId=${stadiumId}`,
    });
  }

  render() {
    const { cardList } = this.state;

    return (
      <View className="card-page">
        <View className="tips">已开通：{cardList.length} 张</View>
        <View className="list">
          {cardList.length ? (
            cardList.map((item) => {
              return (
                <View className="item" onClick={() => this.jumpStadium(item.stadiumId)}>
                  <View className="left">
                    <Image src="" className="icon"></Image>
                  </View>
                  <View className="right">
                    <View className="row">
                      <View className="label">价格</View>：￥
                      {item?.stadium?.monthlyCardPrice}/月
                    </View>
                    <View className="row">
                      <View className="label">开通场馆</View>：{item?.stadium?.name}
                    </View>
                    <View className="row">
                      <View className="label">有效期</View>：{item.validPeriodStart} - {item.validPeriodEnd}
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
