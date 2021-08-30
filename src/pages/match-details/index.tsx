import React, { Component } from 'react';
import { Text, View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  peopleList: Array<any>;
  matchId: string;
  stadiumId: string;
  matchInfo: any;
  matchList: Array<any>;
}

class MatchDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      peopleList: [],
      matchList: [],
      matchId: '',
      stadiumId: '',
      matchInfo: {},
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const matchId = (pageParams.matchId + '').toString();
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.getMatchInfo(matchId);
    this.getPeopleList(matchId, stadiumId);
    this.setState({
      matchId,
      stadiumId,
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
      const matchList = Array(res.totalPeople)
        .fill('')
        .map((d, index) => {
          d = index;
          return d;
        });
      this.setState({
        matchInfo: res,
        matchList,
      });
    });
  }

  getPeopleList(matchId, stadiumId) {
    requestData({
      method: 'POST',
      api: '/order/listByMatch',
      params: {
        matchId,
        stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        peopleList: res,
      });
    });
  }

  handleCancel() {
    const { matchInfo } = this.state;
    Taro.showModal({
      title: '提示',
      content: '确认取消本场次吗？取消只针对本场次，不影响后续重复场次。取消后，已付款订单将自动退款。该操作不能撤销！',
      success: function (res) {
        if (res.confirm) {
          requestData({
            method: 'GET',
            api: '/match/cancel',
            params: {
              id: matchInfo.id,
            },
          }).then(() => {
            Taro.showToast({
              icon: 'none',
              title: '取消场次成功',
            });
            Taro.navigateBack({
              delta: -1,
            });
          });
        }
      },
    });
  }

  render() {
    const { matchList, peopleList, matchInfo } = this.state;

    return (
      <View className={matchInfo.status ? 'match-details-page' : 'match-details-page full'}>
        <View className="list">
          <View className="scroll-wrap">
            {matchList.map((index) => {
              const target = peopleList[index];
              const isMinPeople = (
                <View className="tips-panel">
                  <View className="tips">满{matchInfo.minPeople}人即可开赛</View>
                  <View className="line"></View>
                </View>
              );

              return target ? (
                <View>
                  <View className="item">
                    <Image className="img" src={target.avatarUrl}></Image>
                    <Text className="name">{target.nickName}</Text>
                    <View className="info">
                      <Text className="count">{target.orderStatus}</Text>
                      <Text className="tips">本月第{target.stadiumTempCount}次报名</Text>
                    </View>
                  </View>
                  {index + 1 === matchInfo.minPeople && isMinPeople}
                </View>
              ) : (
                <View>
                  <View className="item">
                    <Image className="img" src=""></Image>
                    <Text className="index">{index}</Text>
                    <Text className="name" style="color: #DEDEDD;">
                      等待报名
                    </Text>
                  </View>
                  {index + 1 === matchInfo.minPeople && isMinPeople}
                </View>
              );
            })}
          </View>
        </View>

        {matchInfo.status && (
          <View className="btn-list">
            <View className="btn" onClick={() => this.handleCancel()}>
              取消本场次
            </View>
            <View className="btn">分享场次</View>
          </View>
        )}
      </View>
    );
  }
}

export default MatchDetailsPage;
