import React, { Component } from 'react';
import { View, Image } from '@tarojs/components';
// import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';

interface IState {
  cardList: Array<any>;
}

class OrderPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      cardList: [{}, {}, {}, {}, {}, {}],
    };
  }

  componentDidShow() {
  }

  render() {
    const { cardList } = this.state;
    console.log(cardList)

    return (
      <View className="card-page">
        <View className="tips">已开通：{cardList.length}张</View>
        <View className="list">
          {cardList.map(() => {
            return (
              <View className="item">
                <View className="left">
                  <Image src={''} className="icon"></Image>
                </View>
                <View className="right">
                  <View className="row">
                    <View className="label">开通场馆</View>：奥斯卡大家说的
                  </View>
                  <View className="row">
                    <View className="label">有效期</View>：2011-01-01—2011-11-11
                  </View>
                </View>
              </View>
            )
          })}

        </View>
      </View>
    );
  }
}

export default OrderPage;
