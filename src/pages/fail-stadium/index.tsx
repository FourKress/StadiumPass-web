import React, { Component } from 'react';
import { Text, View } from '@tarojs/components';
// import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  list: Array<any>;
}

class FailStadiumPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      list: [1, 2, 3, 4, 5, 6],
    };
  }

  render() {
    const { list } = this.state;

    return (
      <View className="fail-stadium-page">
        <View className="list">
          <View className="scroll-warp">
            {list.map(() => {
              return (
                <View className="item">
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
      </View>
    );
  }
}

export default FailStadiumPage;
