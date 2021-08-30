import React, { Component } from 'react';
import { Text, View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  peopleList: Array<any>;
  matchId: string;
}

class MatchDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      peopleList: [],
      matchId: '',
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const matchId = (pageParams.matchId + '').toString();
    this.getPeopleList(matchId);
    this.setState({
      matchId,
    });
  }

  getPeopleList(matchId) {
    requestData({
      method: 'GET',
      api: '/userRMatch/findAllByMatchId',
      params: {
        matchId,
      },
    }).then((res: any) => {
      this.setState({
        peopleList: res,
      });
    });
  }

  render() {
    const { peopleList } = this.state;

    return (
      <View className="match-details-page">
        <View className="list">
          <View className="scroll-wrap">
            {peopleList.map((item) => {
              return (
                <View className="item">
                  <Image className="img" src={item.avatarUrl}></Image>
                  <Text className="name">{item.nickName}</Text>
                  <View className="info">
                    <Text className="count">大声道</Text>
                    <Text className="tips">本月第{item.teamUpCount}次报名</Text>
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

export default MatchDetailsPage;
