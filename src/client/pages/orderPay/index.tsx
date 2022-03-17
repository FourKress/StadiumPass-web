import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import payService from '@/services/payService';

import './index.scss';
import dayjs from 'dayjs';

interface IState {
  orderId: string;
  orderInfo: any;
  countdown: number;
  payAmount: number;
  hasMonthlyCardAmount: number;
  payMethod: string;
  methodDisabled: boolean;
}

let timer: any = null;

class OrderPayPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderId: '',
      orderInfo: {},
      countdown: 0,
      payAmount: 0,
      hasMonthlyCardAmount: 0,
      payMethod: '',
      methodDisabled: false,
    };
  }

  componentDidShow() {
    if (timer) {
      clearInterval(timer);
    }
    // @ts-ignore
    const orderId = Taro.getCurrentInstance().router.params.orderId + '';
    this.getOrderInfo(orderId);
    this.setState({
      orderId,
    });
  }

  getOrderInfo(orderId) {
    requestData({
      method: 'GET',
      api: '/order/info',
      params: {
        id: orderId,
      },
    }).then((res: any) => {
      const {
        monthlyCardStatus,
        monthlyCardPrice,
        totalPrice,
        countdown,
        price,
        monthlyCardPayStatus,
        prepayInfo = null,
        payMethod = null,
        payAmount = 0,
      } = res;
      let state;
      if (prepayInfo && payAmount) {
        state = {
          methodDisabled: false,
          payAmount,
          payMethod: payMethod === 2 ? 'monthlyCard' : 'wechat',
          hasMonthlyCardAmount: payMethod === 2 ? payAmount : undefined,
        };
      } else if (monthlyCardStatus && monthlyCardPayStatus) {
        const diffPrice = totalPrice - price;
        const hasMonthlyCardAmount = res.isMonthlyCard ? diffPrice : monthlyCardPrice + diffPrice;
        state = {
          hasMonthlyCardAmount,
          payAmount: hasMonthlyCardAmount,
          payMethod: 'monthlyCard',
        };
      } else {
        state = {
          payAmount: totalPrice,
          payMethod: 'wechat',
        };
      }
      this.setState(
        {
          ...state,
          orderInfo: res,
          countdown,
        },
        () => {
          if (!countdown || countdown <= 0) return;
          timer = setInterval(() => {
            const { countdown } = this.state;
            if (countdown < 1000) {
              clearInterval(timer);
            } else {
              this.setState({
                countdown: countdown - 1000,
              });
            }
          }, 1000);
        }
      );
    });
  }

  selectPayMethod(payAmount, payMethod) {
    const { orderInfo, methodDisabled } = this.state;
    if (methodDisabled) return;
    if (payMethod === 'monthlyCard' && !orderInfo.monthlyCardPayStatus) return;
    this.setState({
      payAmount,
      payMethod,
    });
  }

  async handleOrderPay() {
    const {
      orderInfo: { matchId },
      orderId,
      payMethod,
    } = this.state;
    await payService(
      {
        orderId,
        payMethod,
      },
      async () => {
        await Taro.reLaunch({
          url: `/client/pages/share/index?matchId=${matchId}`,
        });
      }
    );
  }

  async handleOrderCancel() {
    await Taro.showModal({
      title: '提示',
      content: '确定要取消报名吗?',
      success: async (res) => {
        if (res.confirm) {
          const { orderId } = this.state;
          await requestData({
            method: 'GET',
            api: '/order/getRefundInfo',
            params: {
              orderId,
            },
          });
          await requestData({
            method: 'POST',
            api: '/order/refund',
            params: {
              orderId,
              status: 6,
            },
          });
          await Taro.navigateBack({
            delta: -1,
          });
        }
      },
    });
  }

  render() {
    const { orderInfo, countdown, payAmount, hasMonthlyCardAmount, payMethod, methodDisabled } = this.state;
    const countdownArr = dayjs(countdown).format('mm:ss').split(':');

    const M = countdownArr[0].split('');
    const S = countdownArr[1].split('');

    return (
      <View className="pay-page">
        <View className="top-bar">
          <View className="tips">注意: 超时未支付将取消报名！</View>
          <View className="date">
            <View className="block">{M[0]}</View>
            <View className="block">{M[1]}</View>
            <View className="line">:</View>
            <View className="block">{S[0]}</View>
            <View className="block">{S[1]}</View>
          </View>
        </View>

        <View className="panel">
          <View className="info">
            <View className="top">场次信息</View>
            <View className="row">
              <Text className="label">场馆</Text>
              <Text className="text">{orderInfo.stadiumName}</Text>
            </View>
            <View className="row">
              <Text className="label">场地</Text>
              <Text className="text">
                足球 / {orderInfo.unit} / {orderInfo.spaceName}
              </Text>
            </View>
            <View className="row">
              <Text className="label">时间</Text>
              <Text className="text">
                {orderInfo.runDate?.replace(/-/g, '.').substring(5, 10)} / {orderInfo.runAt} / {orderInfo.duration}小时
              </Text>
            </View>
            <View className="row">
              <Text className="label">人数</Text>
              <Text className="text">{orderInfo.personCount}人</Text>
            </View>
            <View className="row">
              <Text className="label">金额</Text>
              <Text className="text">
                ￥{orderInfo.price}/人，共
                {orderInfo.totalPrice}
              </Text>
            </View>
          </View>
        </View>

        <View className="panel">
          <View className="pay">
            <View className="top">场次信息</View>
            <View className={methodDisabled ? 'row disabled' : 'row'}>
              <Text className="icon icon-1"></Text>
              <Text className="label">微信支付</Text>
              <Text className="money">￥{orderInfo.totalPrice}</Text>
              <Text
                className={payMethod === 'wechat' ? 'pay-icon select' : 'pay-icon'}
                onClick={() => this.selectPayMethod(orderInfo.totalPrice, 'wechat')}
              ></Text>
            </View>
            {orderInfo.monthlyCardStatus && (
              <View>
                <View className={!orderInfo.monthlyCardPayStatus || methodDisabled ? 'row disabled' : 'row'}>
                  <Text className="icon icon-2"></Text>
                  <Text className="label">
                    <Text>场地月卡</Text>
                    {orderInfo.isMonthlyCard && <Text className="text">(每场仅可免费1个名额)</Text>}
                  </Text>
                  <Text className="money">
                    <Text>￥{hasMonthlyCardAmount}</Text>
                    {!orderInfo.isMonthlyCard && <Text className="text">(开通并使用月卡)</Text>}
                  </Text>

                  <Text
                    className={payMethod === 'monthlyCard' ? 'pay-icon select' : 'pay-icon'}
                    onClick={() => this.selectPayMethod(hasMonthlyCardAmount, 'monthlyCard')}
                  ></Text>
                </View>
                {orderInfo.isMonthlyCard ? (
                  <View className="tips month">
                    <View>月卡用户单场仅可免除1个名额的费用</View>
                    <Text>
                      月卡有效期：{orderInfo.validPeriodStart}-{orderInfo.validPeriodEnd}
                    </Text>
                  </View>
                ) : (
                  <View className="tips">
                    月卡有效期内，不限次数免费订场！仅需¥
                    {orderInfo.monthlyCardPrice}/月！
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="details">
          <View>
            <View>注意事项：</View>
            <View>1、报名人数不足最低开赛标准时，即组队失败。订单将自动退款,款项将在1个工作日内按原路全额退回。</View>
            <View>
              2、关于用户主动取消订单的退款规则距开场小于1小时,无法退款;距开场大于1小时,小于2小时,退款80%;距开场大于2小时,可全额退款。
            </View>
            <View>3、场地月卡可随时无责取消订单,但不支持退款。</View>
          </View>
        </View>

        <View className="pay-btn">
          <View className="btn cancel" onClick={() => this.handleOrderCancel()}>
            取消订单
          </View>
          <View className="btn" onClick={() => this.handleOrderPay()}>
            立即支付 ￥{payAmount}
          </View>
        </View>
      </View>
    );
  }
}

export default OrderPayPage;
