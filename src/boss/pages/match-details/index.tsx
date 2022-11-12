import React, { Component } from 'react';
import { Text, View, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import { handleShare, setShareMenu } from '@/services/shareService';

import './index.scss';
import dayjs from 'dayjs';

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

  async componentDidShow() {
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
    await setShareMenu();
  }

  async onShareAppMessage() {
    return await handleShare(this.state);
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
    const tips = matchInfo.type === 1 ? '包场' : '场次';
    Taro.showModal({
      title: '提示',
      content: `确认取消本${tips}吗？取消只针对本${tips}，不影响后续重复${tips}。取消后，已付款订单将自动退款。该操作不能撤销！`,
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
              title: `取消${tips}成功`,
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
      <View
        className={
          matchInfo.status && !matchInfo.isDone && !matchInfo.isCancel
            ? 'match-details-page'
            : 'match-details-page full'
        }
      >
        <View className="list">
          <View className="scroll-wrap">
            {matchList.map((index) => {
              const target = peopleList[index];
              const day = dayjs().format('YYYY-MM-DD');

              const isMinPeople = (
                <View className="tips-panel">
                  <View className="tips">满{matchInfo.minPeople}人即可开赛，人数不足自动退款</View>
                  <View className="line"></View>
                </View>
              );

              return target ? (
                <View>
                  <View className="item">
                    <Image className="img" src={target.avatarUrl}></Image>
                    <View className="left">
                      <View className="name">
                        {target.isMonthlyCardPay && <Text className="tag"></Text>}
                        {target.nickName}
                      </View>
                      <View>{target.phoneNum}</View>
                    </View>
                    <View className="info">
                      <Text className="count">{target.orderStatus}</Text>
                      <Text className="tips">
                        本月第{target.stadiumTempCount}次{matchInfo.type === 1 ? '包场' : '报名'}
                      </Text>
                    </View>
                  </View>
                  {index + 1 === matchInfo.minPeople && matchInfo.type !== 1 && isMinPeople}
                </View>
              ) : (
                <View>
                  <View className="item">
                    <Text className="img"></Text>
                    <Text className="index">{index + 1}</Text>
                    <Text className="left" style="color: #DEDEDD;">
                      {matchInfo.type === 1
                        ? `${dayjs(`${day} ${matchInfo.startAt}`)
                            .add(index * matchInfo.interval, 'hours')
                            .format('YYYY-MM-DD HH:mm:ss')
                            .substring(11, 16)} - ${dayjs(`${day} ${matchInfo.startAt}`)
                            .add((index + 1) * matchInfo.interval, 'hours')
                            .format('YYYY-MM-DD HH:mm:ss')
                            .substring(11, 16)}`
                        : `${matchInfo.isCancel ? '组队失败' : matchInfo.isDone ? '已结束' : '等待报名'}`}
                    </Text>
                  </View>
                  {index + 1 === matchInfo.minPeople && matchInfo.type !== 1 && isMinPeople}
                </View>
              );
            })}
          </View>
        </View>

        {matchInfo.status && !matchInfo.isDone && !matchInfo.isCancel && (
          <View className="btn-list">
            {matchInfo.type !== 1 && (
              <View className="btn" onClick={() => this.handleCancel()}>
                取消{matchInfo.type === 1 ? '包场' : '场次'}
              </View>
            )}
            <Button className="btn share" openType="share">
              分享{matchInfo.type === 1 ? '包场' : '场次'}
            </Button>
          </View>
        )}
      </View>
    );
  }
}

export default MatchDetailsPage;
