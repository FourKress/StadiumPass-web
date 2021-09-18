import React, { Component } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

// import dayjs from 'dayjs';

import './index.scss';

import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';

interface IState {
  headerPosition: any;
  searchValue: string;
}

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

@inject('tabBarStore')
@observer
class WaitStartPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      headerPosition: {},
      searchValue: '',
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
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
    const { height } = menuButton;

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
        <View className="page-header" style={{ height: headerPosition.top + 44 }}>
          <View className="title" style={{ top: headerPosition.top }}>
            报名
          </View>
          <View className="search" style={headerPosition}>
            <AtIcon className="icon" value="search" size="14" color="#C7C7CC"></AtIcon>
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
        <View className="my-match">
          <Swiper className="swiper-wrapper" indicatorColor="#999" indicatorActiveColor="#0080ff" indicatorDots>
            {[1, 2, 3].map(() => {
              return (
                <SwiperItem>
                  <View className="panel">
                    <View className="title">我的场次</View>
                    <View className="info">
                      <Image src="" className="logo" />
                      <View className="details">
                        <View className="name">卡拉三等奖分手快乐阿斯达大喀纳</View>
                        <View className="sub">阿斯达四大阿斯达</View>
                      </View>
                    </View>
                    <View className="line"></View>
                    <View className="match-info">
                      <View className="left">
                        <View className="tips">当前成员</View>
                        <View className="count">
                          <View>
                            <Text className="bold">11</Text>/22
                          </View>
                          <View className="tag wait">已成团</View>
                        </View>
                      </View>
                      <View className="right">
                        <View className="tips">场次时间</View>
                        <View>
                          <Text className="bold">19:00-21:00</Text>/06-01/周二
                        </View>
                      </View>
                    </View>
                  </View>
                </SwiperItem>
              );
            })}
          </Swiper>
        </View>

        <View className="main">
          <View className="nav">
            <View className="left">
              <View className="item">全部</View>
              <View className="item">收藏</View>
            </View>
            <View className="right">
              <View className="item">推荐</View>
              <View className="item">距离</View>
            </View>
          </View>

          <View className="stadium-list">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(() => {
              return (
                <View className="item">
                  <View className="logo">
                    <Image src="" className="img" />
                    <View className="count">5</View>
                  </View>
                  <View className="info">
                    <View className="name">奥术大师奥术大师大所大所大大所大所大</View>
                    <View>
                      <Text className="address">[渝北区]</Text>
                      <Text className="num">111m</Text>
                    </View>
                  </View>
                  <View className="money">
                    <View className="new">25</View>
                    <View className="old">
                      <View className="price">50</View>
                      <View className="tips">折</View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default WaitStartPage;
