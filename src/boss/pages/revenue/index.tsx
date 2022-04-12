import React, { Component } from 'react';
import { View, Text, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon, AtInput, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtDrawer } from 'taro-ui';
import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

import { validateRegular } from '@/utils/validateRule';
import { checkLogin } from '@/services/loginService';
import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IState {
  summary: any;
  showDrawer: boolean;
  stadiumList: Array<any>;
  stadiumId: string;
  runDate: string;
  revenueInfo: any;
  withdrawAmt: string;
  showWithdrawModal: boolean;
}

const dateNow = () => dayjs().format('YYYY-MM-DD');

@inject('tabBarStore')
@observer
class RevenuePage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      summary: {},
      showDrawer: false,
      stadiumList: [],
      stadiumId: '',
      runDate: dateNow(),
      revenueInfo: {},
      withdrawAmt: '',
      showWithdrawModal: false,
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  async componentDidShow() {
    this.inject.tabBarStore.setSelected(0);
    this.getMonthAndAayStatistics();
    await this.getStadiumList();
    const { stadiumId } = this.state;
    if (!stadiumId) {
      return;
    }
    this.getRevenueInfo({
      runDate: dateNow(),
      stadiumId,
    });
  }

  getMonthAndAayStatistics() {
    requestData({
      method: 'GET',
      api: '/order/monthAndAayStatistics',
    }).then((res) => {
      this.setState({
        summary: res,
      });
    });
  }

  async getStadiumList() {
    await requestData({
      method: 'GET',
      api: '/stadium/stadiumList',
    }).then(async (res: any) => {
      if (!res?.length) {
        await Taro.showToast({
          title: '请先到个人中心完善场馆相关设置',
          icon: 'none',
        });
        return;
      }
      this.setState({
        stadiumList: res,
        stadiumId: res[0].id,
      });
    });
  }

  getRevenueInfo(params) {
    requestData({
      method: 'POST',
      api: '/order/revenueInfo',
      params,
    }).then((res: any) => {
      this.setState({
        revenueInfo: res,
      });
    });
  }

  showTotal() {
    const { stadiumId } = this.state;
    Taro.navigateTo({
      url: `/boss/pages/statistics/index?stadiumId=${stadiumId}`,
    });
  }
  handleShowDrawer() {
    this.setState({
      showDrawer: true,
    });
  }

  handleCloseDrawer() {
    this.setState({
      showDrawer: false,
    });
  }
  handleDateChange(e) {
    const { value } = e.detail;
    this.setState({
      runDate: value,
    });
  }
  handleSelect(e) {
    const index = e.detail.value;
    const value = this.state.stadiumList[index]?.id;
    this.setState({
      stadiumId: value,
    });
  }

  reset() {
    this.setState({
      runDate: dateNow(),
      stadiumId: '',
    });
  }

  async searchSubmit() {
    const { stadiumId, runDate } = this.state;
    await this.getRevenueInfo({
      stadiumId,
      runDate,
    });
    this.handleCloseDrawer();
  }

  jumpDetails(item) {
    const { id, stadiumId } = item;
    Taro.navigateTo({
      url: `/boss/pages/revenue-details/index?stadiumId=${stadiumId}&matchId=${id}`,
    });
  }

  handleWithdrawModal(status) {
    if (status) {
      if (!checkLogin()) return;
    }
    this.setState({
      showWithdrawModal: status,
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

  getWithdrawValue(value) {
    this.setState({
      withdrawAmt: value,
    });
  }

  render() {
    const { summary, showDrawer, stadiumList, stadiumId, runDate, revenueInfo, showWithdrawModal, withdrawAmt } =
      this.state;

    return (
      <View className="indexPage">
        <View className="top-info">
          <View className="top">
            <View className="left">
              <View className="title">今日总收入</View>
              <View className="total">{summary.dayCount}</View>
            </View>
            <View className="right" onClick={() => this.showTotal()}>
              <Text>统计</Text>
              <AtIcon value="chevron-right" size="20" color="#fff"></AtIcon>
            </View>
          </View>
          <View className="banner">
            <View className="item">
              <View className="title">本月总收入</View>
              <View className="text">{summary.monthCount}</View>
            </View>
            <View className="item">
              <View className="title">钱包余额</View>
              <View className="text">{summary.balanceAmt}</View>
            </View>
            <View className="right-btn" onClick={() => this.handleWithdrawModal(true)}>
              提现
            </View>
          </View>
        </View>

        <View className="panel">
          <View className="row">
            <Text className="name">营收</Text>
            <View className="btn" onClick={() => this.handleShowDrawer()}>
              <AtIcon className="search-icon" value="search" size="14" color="#000"></AtIcon>
              <Text>自定义查询</Text>
            </View>
          </View>

          <View className="list-panel">
            <View className="info">
              <View className="title">
                <Text>{revenueInfo.runDate}</Text>
                <Text>{revenueInfo.stadiumName}</Text>
              </View>

              {revenueInfo?.matchCoverOrderList?.map((item) => {
                return (
                  <View className="list">
                    <View className="item" onClick={() => this.jumpDetails(item)}>
                      <View className="left">
                        <Text>
                          {item.startAt} — {item.endAt}
                        </Text>
                        <Text className="index">{item.space.name}</Text>
                      </View>
                      <View className="right">
                        {item.selectPeople < item.minPeople ? (
                          <View className="price">
                            <View className="fail">组队失败</View>
                            <View className="tips">差{item.minPeople - item.selectPeople}人</View>
                          </View>
                        ) : (
                          <View className="price">
                            <View className="success">
                              <Text className="sign">
                                <Text style="font-size: 18px;">+</Text>
                                <Text style="font-size: 14px;">￥</Text>
                              </Text>
                              <Text className="money">{item.sumPayAmount}</Text>
                            </View>
                            <View className="tips">
                              {item.ordinaryCount > 0 && (
                                <Text>
                                  ￥{item.rebatePrice}X{item.ordinaryCount}
                                </Text>
                              )}
                              {item.monthlyCardCount > 0 && <Text> + {item.monthlyCardCount}月卡</Text>}
                              {item.refundAmt > 0 && <Text> + 水费{item.refundAmt}</Text>}
                            </View>
                          </View>
                        )}

                        <AtIcon value="chevron-right" size="20" color="#93A7B6"></AtIcon>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/*{revenueInfo?.matchCoverOrderList?.length > 0 && (*/}
              {/*  <View className="service-fee">*/}
              {/*    <View className="left">技术服务费</View>*/}
              {/*    <View className="right">*/}
              {/*      <View>*/}
              {/*        <Text className="sign">*/}
              {/*          <Text style="font-size: 18px;">+</Text>*/}
              {/*          <Text style="font-size: 14px;">￥</Text>*/}
              {/*        </Text>*/}
              {/*        <Text className="money">0.00</Text>*/}
              {/*      </View>*/}
              {/*      <View className="percentage">-0%</View>*/}
              {/*    </View>*/}
              {/*  </View>*/}
              {/*)}*/}

              <View className="footer">
                <Text>今日总收入：</Text>
                <View className="total">
                  <View className="sign">
                    <Text style="font-size: 18px;">+</Text>
                    <Text style="font-size: 14px;">￥</Text>
                  </View>
                  <View className="money">{revenueInfo.stadiumSumAmount}</View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <AtDrawer show={showDrawer} onClose={() => this.handleCloseDrawer()} mask width="260px" right>
          <View className="drawer-panel">
            <View className="drawer-top">
              <Text>自定义查询</Text>
              <AtIcon onClick={() => this.handleCloseDrawer()} value="close" size="16" />
            </View>
            <View className="form-panel">
              <View className="drawer-item">
                <Picker mode="selector" rangeKey="name" range={stadiumList} onChange={(e) => this.handleSelect(e)}>
                  <View className="title">请选择场馆</View>
                  <AtInput
                    name="stadiumId"
                    onChange={() => {}}
                    value={stadiumList.find((d) => d.id === stadiumId)?.name}
                    editable={false}
                  ></AtInput>
                </Picker>
              </View>
              <View className="drawer-item">
                <Picker value={runDate} mode="date" onChange={(e) => this.handleDateChange(e)}>
                  <View className="title">请选择时间</View>
                  <AtInput name="runDate" onChange={() => {}} value={runDate} editable={false}></AtInput>
                </Picker>
              </View>
            </View>
            <View className="drawer-footer">
              <Text onClick={() => this.reset()}>重置</Text>
              <View className="submit-btn" onClick={() => this.searchSubmit()}>
                确定
              </View>
            </View>
          </View>
        </AtDrawer>

        <AtModal isOpened={showWithdrawModal}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            <View className="withdraw-tips">单日提现次数不能超过10次</View>
            <View className="withdraw-tips">单日提现金额不能超过2000元</View>
            {showWithdrawModal && (
              <AtInput
                className="withdrawAmt"
                name="value"
                title="提现金额"
                type="number"
                placeholder="请输入提现金额"
                value={withdrawAmt}
                onChange={(value) => this.getWithdrawValue(value)}
              />
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.handleWithdrawModal(false)}>取消</Button>
            <Button onClick={() => this.sendWithdrawRequest()}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

export default RevenuePage;
