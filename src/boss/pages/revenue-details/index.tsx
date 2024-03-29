import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

interface IState {
  payInfo: any;
  stadiumId: string;
  stadiumInfo: any;
  matchInfo: any;
  matchId: string;
}

class RevenueDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      payInfo: {},
      stadiumId: '',
      matchId: '',
      stadiumInfo: {},
      matchInfo: {},
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const matchId = (pageParams.matchId + '').toString();
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.setState({
      stadiumId,
      matchId,
    });
    this.getStadiumInfo(stadiumId);
    this.getMatchInfo(matchId);
    this.getOrderList(matchId);
  }

  getStadiumInfo(stadiumId) {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id: stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        stadiumInfo: res,
      });
    });
  }

  getMatchInfo(match) {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id: match,
      },
    }).then((res: any) => {
      this.setState({
        matchInfo: res,
      });
    });
  }

  getOrderList(matchId) {
    requestData({
      method: 'GET',
      api: '/order/findOrderByMatchId',
      params: {
        matchId,
      },
    }).then((res: any) => {
      this.setState({
        payInfo: res,
      });
    });
  }

  render() {
    const { payInfo, stadiumInfo, matchInfo } = this.state;
    const success = payInfo?.success?.reduce((sum, curr) => sum + curr.personCount, 0) >= matchInfo.minPeople;
    const list = success ? payInfo?.success : payInfo?.systemRefund;
    const isList = list?.length || payInfo?.cancel?.length || payInfo?.selfRefund?.length;

    return (
      <View className="revenue-details-page">
        <View className={success ? 'top' : 'fail top'}>
          <Text className="left">组队{success ? '成功' : '失败'}</Text>
          <View className="right">
            本场总收入：<Text>￥{success ? payInfo.totalAmount : '0.00'}</Text>
          </View>
        </View>
        <View className="main">
          <View className="title">
            <View className="left">报名详情</View>
            {!success && (
              <View className="right">
                组队失败：差
                {matchInfo.minPeople - payInfo?.systemRefund?.reduce((sum, curr) => sum + curr.personCount, 0)}人
              </View>
            )}
          </View>
          {isList > 0 ? (
            <View className="signUp-list">
              {list?.length > 0 && (
                <View className={success ? 'sub-title pay' : 'sub-title fail'}>
                  <View>已{success ? '付' : '退'}款</View>
                  {!success && <View>系统自动退款</View>}
                </View>
              )}
              {list?.map((item, index) => {
                return (
                  <View className="item">
                    <View className="index">{index + 1}</View>
                    <View className="user">
                      <Image src={item.user?.avatarUrl}></Image>
                      <Text className="name">{item.user?.nickName}</Text>
                    </View>
                    <View className="info">
                      {item.payMethod === 1 ? (
                        <View className="label">{(item.payAmount - item.compensateAmt).toFixed(2)}</View>
                      ) : item.newMonthlyCard ? (
                        <View className="label">
                          {item.personCount > 1 ? (
                            <Text>
                              {(item.payAmount - (item.personCount - 1) * item.matchId.rebatePrice).toFixed(2)}+
                              {((item.personCount - 1) * item.matchId.rebatePrice - item.compensateAmt).toFixed(2)}
                            </Text>
                          ) : (
                            item.payAmount.toFixed(2)
                          )}
                        </View>
                      ) : (
                        <View className="label">
                          月卡支付
                          {item.personCount > 1 && (
                            <Text>
                              +{((item.personCount - 1) * item.matchId.rebatePrice - item.compensateAmt).toFixed(2)}
                            </Text>
                          )}
                        </View>
                      )}
                      {item.newMonthlyCard ? (
                        <View className="count">新购月卡</View>
                      ) : item.payMethod === 2 ? (
                        <View className="count">
                          有效期至：{dayjs(item.monthlyCardValidDate).format('MM-DD')} 00:00
                        </View>
                      ) : (
                        <View className="count">付款时间：{dayjs(item.payAt).format('MM-DD HH:MM')}</View>
                      )}
                    </View>
                  </View>
                );
              })}
              {payInfo?.cancel?.length > 0 && <View className="sub-title">未付款</View>}
              {payInfo?.cancel?.map((item, index) => {
                return (
                  <View className="item fail">
                    <View className="index">{index + 1}</View>
                    <View className="user">
                      <Image src={item.user?.avatarUrl}></Image>
                      <Text className="name">{item.user?.nickName}</Text>
                    </View>
                    <View className="info">
                      <View className="count">报名时间：{dayjs(item.createAt).format('MM-DD HH:MM')}</View>
                    </View>
                  </View>
                );
              })}
              {payInfo?.selfRefund?.length > 0 && <View className="sub-title fail">本人退款</View>}
              {payInfo?.selfRefund?.map((item, index) => {
                return (
                  <View className="item fail">
                    <View className="index">{index + 1}</View>
                    <View className="user">
                      <Image src={item.user?.avatarUrl}></Image>
                      <Text className="name">{item.user?.nickName}</Text>
                    </View>
                    <View className="info opacity">
                      {item.payMethod === 1 ? (
                        <View className="label">
                          <View>-{item.refundAmount.toFixed(2)}</View>
                        </View>
                      ) : (
                        <View className="label">
                          {item.newMonthlyCard ? '新购月卡' : '月卡退款'}
                          {item.personCount > 1 && (
                            <Text>
                              &nbsp;&nbsp;
                              <Text>-{item.refundAmount.toFixed(2)}</Text>
                            </Text>
                          )}
                        </View>
                      )}

                      <View className="count">退款时间：{dayjs(item.updatedAt).format('MM-DD HH:MM')}</View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="not-data" style="margin-top: 8px">
              无报名数据
            </View>
          )}

          <View className="title">场次详情</View>
          <View className="stadium-list">
            <View className="item">
              <Text className="left">本地时间</Text>
              <Text className="right">
                {matchInfo.runDate} {matchInfo.startAt}—{matchInfo.endAt}
              </Text>
            </View>
            <View className="item">
              <Text className="left">本地场次</Text>
              <Text className="right">{stadiumInfo.name}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default RevenueDetailsPage;
