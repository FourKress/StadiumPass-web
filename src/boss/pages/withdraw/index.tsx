import React, { Component } from 'react';
import { View } from '@tarojs/components';
import requestData from '@/utils/requestData';

import './index.scss';
import { validateRegular } from '@/utils/validateRule';
import Taro from '@tarojs/taro';

interface IState {
  tabActive: number;
  withdrawAmt: string;
  withdrawTotalAmt: number;
}

const tabList = [
  {
    label: '我要提现',
    value: 0,
  },
  {
    label: '提现记录',
    value: 1,
  },
];

class WithdrawPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      tabActive: 0,
      withdrawAmt: '',
      withdrawTotalAmt: 0,
    };
  }

  componentDidShow() {
    this.getMonthAndAayStatistics();
  }

  getMonthAndAayStatistics() {
    requestData({
      method: 'GET',
      api: '/order/monthAndAayStatistics',
    }).then((res: any) => {
      this.setState({
        withdrawTotalAmt: res?.balanceAmt ?? 0,
      });
    });
  }

  setWithdraw(value) {
    this.setState({
      withdrawAmt: value,
    });
  }

  async sendWithdrawRequest() {
    const { withdrawAmt } = this.state;
    if (!validateRegular.number.test(withdrawAmt)) {
      await Taro.showToast({
        title: '请输入正确的数字',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    if (parseInt(withdrawAmt) > 2000) {
      await Taro.showToast({
        title: '单日、单次提现金额不能超过2000元',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    console.log(withdrawAmt);
    return;
    requestData({
      method: 'POST',
      api: '/user/modify',
      params: {
        withdrawAmt,
      },
    }).then(() => {
      this.getMonthAndAayStatistics();
    });
  }

  render() {
    const { tabActive, withdrawAmt, withdrawTotalAmt } = this.state;

    return (
      <View className="withdraw-page">
        <View className="top">
          {tabList.map((item, index) => {
            return (
              <View className={index === tabActive ? 'btn active' : 'btn'} key={item.value}>
                {item.label}
              </View>
            );
          })}
        </View>
        <View className="panel">
          <View className="title">提现金额</View>
          <View className="row">
            <View className="amount">{withdrawAmt}</View>
          </View>
        </View>

        <View className="info">
          <View className="row">
            <View>当前可用余额¥{withdrawTotalAmt}元，</View>
            <View className="btn" onClick={() => this.setWithdraw(withdrawTotalAmt)}>
              全部提现
            </View>
          </View>
          <View className="tips">因微信支付限制，请知悉：</View>
          <View className="tips">单日提现金额：≤2000元；单日提现次数：≤10次。</View>
        </View>
      </View>
    );
  }
}

export default WithdrawPage;
