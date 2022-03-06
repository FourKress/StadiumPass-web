import React, { Component } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';

import './index.scss';
import requestData from '@/utils/requestData';
import { handleShare, setShareMenu } from '@/services/shareService';

interface IState {
  matchId: string;
  matchInfo: any;
  meHeaderPosition: any;
  unitList: any[];
}

class SharePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      matchId: '',
      matchInfo: {},
      meHeaderPosition: {},
      unitList: [],
    };
  }

  async componentDidShow() {
    this.setMeBtnPosition();
    // @ts-ignore
    const matchId = Taro.getCurrentInstance().router.params.matchId + '';
    this.getMatchInfo(matchId);
    await this.getUnitList();
    this.setState({
      matchId,
    });
    await setShareMenu();
  }

  async getUnitList() {
    await requestData({
      method: 'GET',
      api: '/space/unitEnum',
    }).then((res: any) => {
      this.setState({
        unitList: res,
      });
    });
  }

  setMeBtnPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    this.setState({
      meHeaderPosition: {
        top: stateHeight,
      },
    });
  }

  getMatchInfo(id) {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id,
      },
    }).then((res: any) => {
      this.setState({
        matchInfo: res,
      });
    });
  }

  async onShareAppMessage() {
    return await handleShare(this.state);
  }

  async goBack() {
    await Taro.switchTab({
      url: '/client/pages/waitStart/index',
    });
  }

  render() {
    const { matchInfo, meHeaderPosition } = this.state;
    const success = matchInfo.minPeople - matchInfo.selectPeople;
    const max = matchInfo.totalPeople - matchInfo.selectPeople;

    return (
      <View className="share-page">
        <View className="page-header" style={`padding-top: ${meHeaderPosition.top}px`}>
          <View className="header-panel">
            <AtIcon
              className="back-icon"
              value="chevron-left"
              size="24"
              color="#000"
              onClick={() => this.goBack()}
            ></AtIcon>
            <View className="page-title">
              <Text>场馆详情</Text>
            </View>
          </View>
        </View>
        <View className="panel">
          <AtIcon value="check-circle" size="60" color="#00E36A"></AtIcon>
          <View className="title">报名成功</View>
          {max > 0 ? (
            <View>
              {success > 0 ? (
                <View className="tips">还差{matchInfo.minPeople - matchInfo.selectPeople}人就组队成功了！</View>
              ) : (
                <View className="tips">还有{matchInfo.totalPeople - matchInfo.selectPeople}个空位可报名！</View>
              )}
              <View className="tips">{`${
                success > 0 ? '为了提高成功率，' : '为了更精彩的比赛，'
              }赶快邀请好友一起加入吧！`}</View>
            </View>
          ) : (
            <View>哇哦~，该场次已满场，尽情奔跑吧！</View>
          )}
        </View>
        <Button className="share-button" openType="share">
          分享到群
        </Button>
      </View>
    );
  }
}

export default SharePage;
