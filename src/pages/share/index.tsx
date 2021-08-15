import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';

import './index.scss';

interface IState {
  type: string;
}

class SharePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      type: '',
    };
  }

  async componentDidShow() {
    // @ts-ignore
    await Taro.showShareMenu({
      withShareTicket: true,
      // @ts-ignore
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    // @ts-ignore
    const type = Taro.getCurrentInstance().router.params.type + '';
    this.setState({
      type,
    });
  }

  onShareAppMessage() {}

  render() {
    return (
      <View className="share-page">
        <View className="panel">
          <AtIcon value="check-circle" size="60" color="#00E36A"></AtIcon>
          <View className="title">报名成功</View>
          <View className="tips">还差8人就组队成功了！</View>
          <View className="tips">为了提高成功率，赶快邀请好友一起加入吧！</View>
        </View>
        <Button className="share-button" openType="share">
          分享到群
        </Button>
      </View>
    );
  }
}

export default SharePage;
