import React, { Component } from 'react';
import { View, Image } from '@tarojs/components';
import requestData from '@/utils/requestData';

import './index.scss';
import { validateRegular } from '@/utils/validateRule';
import Taro from '@tarojs/taro';
import { throttle } from 'lodash';

interface IState {
  tabActive: number;
  withdrawAmt: string;
  withdrawTotalAmt: number;
  withdrawRecords: any[];
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
      withdrawRecords: [],
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

  async setWithdraw(value) {
    let withdrawAmt = String(this.state.withdrawAmt) + String(value);
    if (!/^\d+(?:\.\d{0,2})?$/.test(withdrawAmt)) {
      const regExp = /(\d+)(.)(\d{2})\d*/;
      withdrawAmt = withdrawAmt.replace(regExp, '$1$2$3');
    }
    await Taro.vibrateShort({ complete: () => {} });
    if (withdrawAmt?.length > 7) {
      withdrawAmt = withdrawAmt.substring(0, 7);
    }
    this.setState({
      withdrawAmt,
    });
  }

  async removeWithdraw() {
    const withdrawAmt = this.state.withdrawAmt;
    const value = withdrawAmt.slice(0, -1);
    await Taro.vibrateShort({ complete: () => {} });
    this.setState({
      withdrawAmt: value,
    });
  }

  handleThrottle = (fun) =>
    throttle(fun, 1000, {
      leading: true,
      trailing: false,
    });

  sendWithdrawRequest = async () => {
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
    await Taro.showLoading({
      title: '处理中...',
      mask: true,
    });
    requestData({
      method: 'POST',
      api: '/withdraw/create',
      params: {
        withdrawAmt,
      },
    }).then(async () => {
      await Taro.hideLoading();
      await Taro.navigateBack({
        delta: -1,
      });
      await Taro.showToast({
        icon: 'none',
        title: '提现成功!',
      });
    });
  };

  getWithdrawRecords() {
    requestData({
      method: 'GET',
      api: '/withdraw/records',
    }).then((res: any) => {
      this.setState({
        withdrawRecords: res,
      });
    });
  }

  changeTab(value) {
    if (value === 1) {
      this.getWithdrawRecords();
    }
    this.setState({
      tabActive: value,
    });
  }

  render() {
    const { tabActive, withdrawAmt, withdrawTotalAmt, withdrawRecords } = this.state;

    return (
      <View className="withdraw-page">
        <View className="top">
          {tabList.map((item, index) => {
            return (
              <View
                className={index === tabActive ? 'btn active' : 'btn'}
                key={item.value}
                onClick={() => this.changeTab(item.value)}
              >
                {item.label}
              </View>
            );
          })}
        </View>

        {tabActive === 0 ? (
          <View>
            <View className="panel">
              <View className="title">提现金额</View>
              <View className="row">
                <View className="amount">{withdrawAmt}</View>
              </View>
            </View>
            <View className="info">
              <View className="row">
                <View>当前可用余额¥{withdrawTotalAmt}元，</View>
                <View className="btn" onClick={() => this.setState({ withdrawAmt: String(withdrawTotalAmt) })}>
                  全部提现
                </View>
              </View>
              <View className="tips">因微信支付限制，请知悉：</View>
              <View className="tips">单日提现金额：≤2000元；单日提现次数：≤10次。</View>
            </View>
          </View>
        ) : withdrawRecords.length > 0 ? (
          <View className="records">
            {withdrawRecords.map((d) => {
              return (
                <View className="item">
                  <View className="top">
                    <View className="left">{d.monthName}</View>
                    <View className="right">收入¥{d.totalAmt.toFixed(2)}</View>
                  </View>
                  <View className="list">
                    {d.list.map((r) => {
                      return (
                        <View className="row">
                          <View className="left">
                            <View className="title">提现-到微信零钱</View>
                            <View className="time">{r.time}</View>
                          </View>
                          <View className="right">¥{r.withdrawAmt.toFixed(2)}</View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="not-data" style="margin-top: 16px">
            暂无数据
          </View>
        )}

        {tabActive === 0 && (
          <View className="keyboard">
            <View className="left">
              <View className="wrap">
                {Array.from({ length: 9 }, (_item, index) => index + 1).map((d) => {
                  return (
                    <View className="btn" onClick={() => this.setWithdraw(d)}>
                      {d}
                    </View>
                  );
                })}
              </View>
              <View className="row">
                <View className="btn zero" onClick={() => this.setWithdraw(0)}>
                  0
                </View>
                <View className="btn point" onClick={() => this.setWithdraw('.')}>
                  .
                </View>
              </View>
            </View>
            <View className="right">
              <View className="btn clear" onClick={() => this.removeWithdraw()}>
                <Image className="img" src={require('../../../assets/icons/clear-btn.png')} />
              </View>
              <View className="btn submit" onClick={this.handleThrottle(this.sendWithdrawRequest)}>
                提现
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default WithdrawPage;
