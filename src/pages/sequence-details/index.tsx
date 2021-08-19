import React, { Component } from 'react';
import { Text, View, Image } from '@tarojs/components';
// import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  list: Array<any>;
}

class SequenceDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      list: Array(12).fill(''),
    };
  }

  render() {
    const { list } = this.state;

    return (
      <View className="sequence-details-page">
        <View className="list">
          <View className="scroll-wrap">
            {list.map(() => {
              return (
                <View className="item">
                  <Image className="img" src=""></Image>
                  <Text className="name">等待报名</Text>
                  <View className="info">
                    <Text className="count">大声道</Text>
                    <Text className="tips">打发第三方</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="btn-list">
          <View className="btn">取消本场次</View>
          <View className="btn">分享场次</View>
        </View>
      </View>
    );
  }
}

export default SequenceDetailsPage;
