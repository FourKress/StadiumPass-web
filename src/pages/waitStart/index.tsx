import React, { Component } from 'react';
import { View, Text, Picker, Image } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

// import dayjs from 'dayjs';

import './index.scss';

interface IState {
  headerPosition: any;
  searchValue: string;
}

class WaitStartPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      headerPosition: {},
      searchValue: '',
    };
  }

  componentDidShow() {
    this.setHeaderPosition();
  }

  setHeaderPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const top = menuButton.top - stateHeight; //  获取top值
    const { width, left, height } = menuButton;

    this.setState({
      headerPosition: {
        top: stateHeight + top,
        height,
        borderRadius: height,
      },
    });
  }

  handleSearchChange(value) {
    this.setState({
      searchValue: value,
    });
    console.log(value);
  }

  render() {
    const { headerPosition, searchValue } = this.state;

    return (
      <View className="wait-start-page">
        <View className="page-header">
          <View className="title">报名</View>
          <View className="search" style={headerPosition}>
            <AtInput
              name="search"
              type="text"
              placeholder="搜索场馆"
              placeholderClass="search-input"
              clear
              value={searchValue}
              onChange={(value) => this.handleSearchChange(value)}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default WaitStartPage;
