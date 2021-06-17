import React, { Component } from 'react';
import { View } from '@tarojs/components';
// import {  } from "taro-ui"
// import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';

interface IState {
  orderList: Array<any>;
}

class StadiumPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
    };
  }

  componentDidShow() {}

  render() {
    return (
      <View className="stadium-page">
        <View className="page-header">asd</View>
      </View>
    );
  }
}

export default StadiumPage;
