import React, { Component } from 'react';
import { Text, View } from '@tarojs/components';
import { AtTabBar } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  list: Array<any>;
  current: number;
  stadiumId: string;
}

class StadiumDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      list: [],
      stadiumId: '',
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.id + '').toString();
    this.setState({
      stadiumId,
    });
  }

  handleTabClick(index) {
    this.setState({
      current: index,
    });
  }

  jumpDetails(item) {
    console.log(item);
    Taro.navigateTo({
      url: '../sequence-details/index',
    });
  }

  jumpFailStadium() {
    Taro.navigateTo({
      url: '../fail-stadium/index',
    });
  }

  render() {
    const { current } = this.state;

    return (
      <View className="stadium-details-page">
        <AtTabBar
          tabList={[{ title: '场次设置' }, { title: '场馆设置' }]}
          onClick={(index) => this.handleTabClick(index)}
          current={current}
        />
        <View className="list">
          <View className="scroll-warp">
            {[1, 2, 3, 4, 5, 6].map((item) => {
              return (
                <View className="item" onClick={() => this.jumpDetails(item)}>
                  <View className="top">
                    <View className="left">重复场次</View>
                    <View className="right">
                      <View className="money">
                        <Text>￥30</Text>
                        <Text className="discount">5折</Text>
                        <Text>/人；</Text>
                      </View>
                      <Text className="err">不支持月卡</Text>
                    </View>
                  </View>
                  <View className="item-body">
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <View className="btn-list">
          <View className="btn" onClick={() => this.jumpFailStadium()}>
            已失效场次
          </View>
          <View className="btn">新建场次</View>
        </View>
      </View>
    );
  }
}

export default StadiumDetailsPage;
