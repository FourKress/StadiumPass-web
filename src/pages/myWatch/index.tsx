import React, { Component } from 'react';
import { View } from '@tarojs/components';
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
        <View>312</View>
      </View>
    );
  }
}

export default OrderPage;
