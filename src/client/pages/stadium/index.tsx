import React, { Component } from 'react';
import { View, Text, Image, Picker, Swiper, SwiperItem } from '@tarojs/components';
import { AtTabs, AtIcon, AtTabsPane, AtTextarea } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import dayjs from 'dayjs';
import * as currency from 'currency.js';

import './index.scss';
import { SERVER_DOMAIN, SERVER_PROTOCOL, SERVER_STATIC } from '@/src/config';

const STAR_DATE = dayjs().format('YYYY.MM.DD');
const END_DATE = dayjs().add(13, 'day').format('YYYY.MM.DD');
import LoginStore from '@/store/loginStore';
import { inject, observer } from 'mobx-react';
import { setGlobalData } from '@/utils/globalData';
import { handleShare, setShareMenu } from '@/services/shareService';
import { throttle } from 'lodash';

interface IState {
  tabValue: number;
  openList: any;
  stadiumInfo: any;
  isWatch: boolean;
  spaceList: any;
  matchList: any;
  userId: string;
  authorize: boolean;
  stadiumId: string;
  spaceActive: number;
  currentMatch: any;
  personList: any;
  selectList: any;
  spaceDate: string;
  orderId?: string;
  openIndex: number;
  unitList: any;
  headerPosition: any;
  cancelDialog: boolean;
  refundInfo: any;
  spaceId?: string;
  matchId?: string;
}

interface InjectStoreProps {
  loginStore: LoginStore;
}

const tabList = [{ title: '场次报名' }, { title: '场馆介绍' }];
const currentDay = () => dayjs().format('YYYY-MM-DD');

@inject('loginStore')
@observer
class StadiumPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = { ...this.initData(), headerPosition: {} };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  async onShareAppMessage() {
    const { stadiumInfo, spaceDate, spaceList, spaceActive, currentMatch } = this.state;
    const { id, startAt, endAt, selectPeople, minPeople, totalPeople, isDone, isCancel } = currentMatch;
    const space = spaceList[spaceActive];
    const matchInfo = {
      stadium: stadiumInfo,
      space,
      runDate: spaceDate,
      startAt,
      endAt,
      id,
      selectPeople,
      minPeople,
      totalPeople,
      isDone,
      isCancel,
    };
    return handleShare({
      matchInfo,
    });
  }

  initData() {
    return {
      tabValue: 0,
      openList: [],
      stadiumInfo: {},
      isWatch: false,
      spaceList: [],
      matchList: [],
      userId: '',
      authorize: false,
      stadiumId: '',
      spaceActive: 0,
      currentMatch: {},
      selectList: [],
      spaceDate: currentDay(),
      orderId: '',
      openIndex: 0,
      unitList: [],
      personList: [],
      cancelDialog: false,
      refundInfo: {},
      spaceId: '',
      matchId: '',
    };
  }

  async componentWillMount() {
    await this.setHeaderPosition();
    // @ts-ignore
    const pageParams = await Taro.getCurrentInstance().router.params;
    const id = pageParams.stadiumId + '';
    const matchId = pageParams.matchId;
    const orderId = pageParams?.orderId;
    const runDate = pageParams?.runDate;
    const spaceId = pageParams?.spaceId;
    await this.setState({
      ...this.initData(),
      stadiumId: id,
      orderId,
      spaceId,
      matchId,
    });
    if (!id) return;
    this.getStadiumInfo(id);
    await this.getUnitList();
    if (!orderId) {
      if (runDate && runDate !== currentDay()) {
        await this.onSpaceDateChange({
          detail: {
            value: runDate,
          },
        });
      } else {
        await this.getSpace(id, currentDay());
      }
    } else {
      this.getOrderMatch(matchId);
    }
    const userId = Taro.getStorageSync('userInfo').id || '';
    if (userId) {
      this.loginInit(userId);
    } else {
      await this.checkLogin();
    }
    await setShareMenu();
  }

  async componentDidShow() {
    setGlobalData('pageCtx', this);
    await this.handleRefreshPeoPle(this.state.openIndex, true);
  }

  componentWillUnmount() {
    this.inject.loginStore.setUserInfo('');
    setGlobalData('pageCtx', '');
  }

  async setHeaderPosition() {
    let stateHeight = 0; //  接收状态栏高度
    await Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const top = menuButton.top - stateHeight; //  获取top值
    const { width, left, height } = menuButton;
    this.setState({
      headerPosition: {
        left: left - 16 - 88,
        // top: stateHeight + top + (height - 24) / 2,
        top: stateHeight + top,
        height,
        width,
        borderRadius: height,
      },
    });
  }

  loginInit(userId) {
    this.props.loginStore.setUserInfo('');
    if (!userId) {
      this.setState({
        authorize: true,
      });
      return;
    }
    this.setState(
      {
        userId,
      },
      () => {
        this.getWatchStatus(this.state.stadiumId);
      }
    );
  }

  getStadiumInfo(id) {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id,
      },
    }).then((res: any) => {
      this.setState({
        stadiumInfo: res,
      });
    });
  }

  getWatchStatus(stadiumId) {
    requestData({
      method: 'POST',
      api: '/userRStadium/watchFlag',
      params: {
        stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        isWatch: res?.isWatch,
      });
    });
  }

  getSpace(stadiumId, runDate) {
    return requestData({
      method: 'POST',
      api: '/space/list',
      params: {
        stadiumId,
        runDate,
      },
    }).then(async (res: any) => {
      if (!res?.length) {
        await Taro.showToast({
          icon: 'none',
          title: '暂无组队场次，请重新选择其它日期。',
        });
        return false;
      }
      const spaceId = this.state.spaceId || res[0]?.id;
      const spaceActive = res.findIndex((d) => d.id === spaceId);
      this.getMatchList(spaceId, runDate, spaceActive);
      this.setState({
        spaceList: res,
        selectList: [],
        spaceId: '',
      });
      return res;
    });
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

  async onSpaceDateChange(e) {
    const { value } = e.detail;
    const { spaceDate } = this.state;
    if (value === spaceDate) return;
    const result = await this.getSpace(this.state.stadiumId, value);
    this.setState({
      spaceDate: result ? value : spaceDate,
    });
  }

  getMatchList(spaceId, runDate, index) {
    requestData({
      method: 'POST',
      api: '/match/info',
      params: {
        spaceId,
        runDate,
      },
    }).then(async (res: any) => {
      const { matchId } = this.state;
      const openIndex = res.findIndex((d) => (matchId ? d.id === matchId : !d.isDone && !d.isCancel));
      const openList = res.map(() => false);
      openList[openIndex] = true;
      this.setState({
        matchList: res,
        openList,
        spaceActive: index,
        currentMatch: res[openIndex] || res.reverse()[0],
        selectList: [],
        matchId: '',
      });
      await this.getPeoPelList(res[openIndex]);
    });
  }

  getOrderMatch(id) {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id,
      },
    }).then(async (res: any) => {
      const openList = [true];
      this.setState({
        matchList: [res],
        openList,
        currentMatch: res,
        selectList: [],
      });
      await this.getPeoPelList(res);
    });
  }

  getPeoPelList(currentMatch) {
    if (!currentMatch?.id) return;
    return requestData({
      method: 'GET',
      api: '/userRMatch/findAllByMatchId',
      params: {
        matchId: currentMatch.id,
      },
    }).then((res: any) => {
      let list: any = null;
      if (res.length >= currentMatch.totalPeople) {
        list = res;
      } else {
        const personList = new Array(currentMatch.totalPeople).fill({}).map((item, index) => {
          if (index <= res.length - 1) return res[index];
          return item;
        });
        list = personList;
      }
      this.setState({
        personList: list,
        currentMatch,
      });
    });
  }

  handleTabClick(val) {
    this.setState({
      tabValue: val,
    });
  }

  async handlePeoPleOpen(index) {
    const { openList } = this.state;
    const status = openList[index];
    if (!status) {
      await this.handleRefreshPeoPle(index);
    }
    this.setState({
      openList: openList.map((open, i) => {
        open = index === i ? !open : false;
        return open;
      }),
      openIndex: index,
    });
  }

  async handleRefreshPeoPle(index, isRefresh = false) {
    const { matchList, openIndex } = this.state;
    if (openIndex !== index || isRefresh) {
      this.setState({
        selectList: [],
      });
    }
    await this.getPeoPelList(matchList[index]);
  }

  handleSelectPerson(item, index) {
    const { isDone, isCancel } = this.state.currentMatch;
    if (isDone || isCancel) {
      return;
    }
    if (item.nickName) {
      return;
    }
    if (!this.checkLogin()) {
      return;
    }
    const { selectList } = this.state;
    const flag = selectList.some((d) => d === index);
    if (!flag) {
      this.setState({
        selectList: [...selectList, index],
      });
    } else {
      this.setState({
        selectList: selectList.filter((d) => d !== index),
      });
    }
  }

  handleThrottle = (fun) =>
    throttle(fun, 1000, {
      leading: true,
      trailing: false,
    });

  handleSubmit = async () => {
    const {
      currentMatch,
      stadiumId,
      selectList,
      stadiumInfo: { bossId },
    } = this.state;
    if (selectList.length <= 0) return;
    if (currentMatch.selectPeople === currentMatch.totalPeople) return;
    if (!(await this.checkLogin())) return;

    if (currentMatch.chargeModel === 1) {
      await Taro.showModal({
        title: '报名提示',
        content: '该场次收费模式为平摊模式，报名实际金额在场次结束时动态计算，多支付的金额将原路退回。',
        success: async (res) => {
          if (res.confirm) {
            await this.sendSubmit(currentMatch, selectList, stadiumId, bossId);
          }
        },
      });
    } else {
      await this.sendSubmit(currentMatch, selectList, stadiumId, bossId);
    }
  };

  async sendSubmit(currentMatch, selectList, stadiumId, bossId) {
    await Taro.showLoading({
      title: '处理中...',
      mask: true,
    });
    const { spaceId, id } = currentMatch;
    const payAmount = selectList.length * currentMatch.price * (currentMatch.rebate / 10);
    return requestData({
      method: 'POST',
      api: '/order/add',
      params: {
        matchId: id,
        spaceId,
        stadiumId,
        bossId,
        payAmount,
        personCount: selectList.length,
      },
    })
      .then(async (res: any) => {
        await Taro.hideLoading();
        this.jumpOrderPay(res);
      })
      .catch(async () => {
        await Taro.hideLoading();
      });
  }

  jumpOrderPay(orderId) {
    Taro.navigateTo({
      url: `/client/pages/orderPay/index?orderId=${orderId}`,
    });
  }

  async handleCallPhone(phoneNumber) {
    await Taro.makePhoneCall({
      phoneNumber,
    });
  }

  handleWatch() {
    if (!this.checkLogin()) {
      return;
    }
    const { stadiumInfo, isWatch } = this.state;
    if (!stadiumInfo?.id) {
      return;
    }
    requestData({
      method: 'POST',
      api: '/userRStadium/watch',
      params: {
        stadiumId: stadiumInfo.id,
        isWatch: !isWatch,
        stadiumName: stadiumInfo.name,
      },
    }).then((res: any) => {
      this.setState({
        isWatch: res,
      });
    });
  }

  handleCancel(status) {
    if (status) {
      requestData({
        method: 'GET',
        api: '/order/getRefundInfo',
        params: {
          orderId: this.state.orderId,
        },
      }).then((res: any) => {
        this.setState({
          refundInfo: res,
          cancelDialog: status,
        });
      });
    } else {
      this.setState({
        cancelDialog: status,
      });
    }
  }

  handleRefund = async () => {
    const { orderId, refundInfo } = this.state;
    const { refundAmount, refundId, payAmount } = refundInfo;
    await Taro.showLoading({
      title: '处理中...',
      mask: true,
    });
    if (refundAmount === 0) {
      await requestData({
        method: 'POST',
        api: '/order/refund',
        params: {
          orderId,
          status: 3,
          refundType: 2,
        },
      }).catch(async () => await Taro.hideLoading());
      await Taro.showToast({
        icon: 'none',
        title: `订单取消成功，请在订单中查看。`,
      });
      requestData({
        method: 'POST',
        api: '/wx/wechatyBotNotice',
        params: {
          orderId,
          url: 'refundNotice',
        },
      }).then(() => {});
      await this.handleRefundSuccess();
      return;
    }
    requestData({
      method: 'POST',
      api: '/wx/refund',
      params: {
        orderId,
        refundAmount,
        refundId,
        payAmount,
        refundType: 2,
      },
    })
      .then(async () => {
        await Taro.showToast({
          icon: 'none',
          title: '发起退款成功，请在订单中查看。',
        });
        await this.handleRefundSuccess();
      })
      .catch(async () => await Taro.hideLoading());
  };

  async handleRefundSuccess() {
    await Taro.hideLoading();
    this.setState({
      orderId: '',
    });
    this.getSpace(this.state.stadiumId, currentDay()).then(() => {});
    this.handleCancel(false);
  }

  async checkLogin() {
    if (!this.state.userId) {
      await Taro.showModal({
        title: '提示',
        content: '您当前未登录，请先登录。',
        confirmText: '登录',
        success: async (res) => {
          if (res.confirm) {
            const userInfo: any = await LoginService.login();
            this.loginInit(userInfo?.id);
          }
        },
      });
      return false;
    }
    return true;
  }

  async handleAuthorize(status) {
    if (!status) {
      this.setState({
        authorize: status,
      });
      return;
    }
    const userInfo: any = await LoginService.handleAuthorize();

    this.setState(
      {
        userId: userInfo.id,
        authorize: false,
      },
      () => {
        this.loginInit(userInfo.id);
      }
    );
  }

  async goBack() {
    if (this.state.orderId) {
      await Taro.navigateBack({
        delta: -1,
      });
      return;
    }
    await Taro.switchTab({
      url: '/client/pages/waitStart/index',
    });
  }

  async showMap() {
    const { stadiumInfo } = this.state;
    const { latitude, longitude, address } = stadiumInfo;
    await Taro.openLocation({
      latitude,
      longitude,
      scale: 18,
      name: address,
    });
  }

  async jumpCenter() {
    await Taro.switchTab({
      url: '/pages/userCenter/index',
    });
  }

  render() {
    const {
      tabValue,
      openList,
      stadiumInfo,
      isWatch,
      spaceList,
      matchList,
      authorize,
      spaceActive,
      currentMatch,
      personList,
      selectList,
      spaceDate,
      orderId,
      unitList,
      headerPosition,
      cancelDialog,
      refundInfo,
    } = this.state;

    const {
      loginStore: { userId },
    } = this.inject;
    if (userId) {
      this.loginInit(userId);
    }

    const isNow = !dayjs().startOf('day').diff(dayjs(spaceDate));
    const stadiumUrls = stadiumInfo?.stadiumUrls || [];

    return (
      <View className="stadium-page">
        <View className="page-header">
          <Swiper className="swiper-wrapper" autoplay>
            {stadiumUrls.map((img) => {
              return (
                <SwiperItem>
                  <Image className="bg" src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}${SERVER_STATIC}${img?.path}`}></Image>
                </SwiperItem>
              );
            })}
          </Swiper>
          <View className="back-icon" style={{ top: headerPosition.top }}>
            <AtIcon onClick={() => this.goBack()} value="chevron-left" size="24" color="#000"></AtIcon>
          </View>

          <View className="me" style={headerPosition} onClick={() => this.jumpCenter()}>
            <Text className="icon"></Text>
            <Text>我的</Text>
          </View>
        </View>
        <View className="main">
          <View className="top">
            <View className="left">
              <View className="name">{stadiumInfo?.name}</View>
              <View className="address">
                <View className="icon">
                  <AtIcon value="map-pin" size="14" color="#666"></AtIcon>
                </View>
                <Text className="text" onClick={() => this.showMap()}>
                  {stadiumInfo?.address}
                </Text>
              </View>
            </View>
            <AtIcon
              className="watch"
              onClick={() => this.handleWatch()}
              value={isWatch ? 'star-2' : 'star'}
              size="24"
              color={isWatch ? '#FF5D46' : ''}
            ></AtIcon>
          </View>

          <AtTabs
            current={tabValue}
            tabList={tabList}
            swipeable={false}
            onClick={(value) => this.handleTabClick(value)}
          >
            <AtTabsPane current={tabValue} index={0}>
              {!orderId && (
                <View className="space-panel">
                  <View className="list">
                    {spaceList.length > 0 &&
                      spaceList.map((item, index) => {
                        return (
                          <View
                            onClick={() => this.getMatchList(item.id, spaceDate, index)}
                            className={spaceActive === index ? 'item active' : 'item'}
                          >
                            <View className="type">{item.name}</View>
                            <View className="unit">{unitList.find((d) => d.value === item.unit)?.label}</View>
                            {item.full ? (
                              <View className="tips2">满</View>
                            ) : (
                              item.rebate !== 10 && <View className="tips1">折</View>
                            )}
                          </View>
                        );
                      })}
                  </View>
                  <Picker
                    value={spaceDate}
                    start={STAR_DATE}
                    end={END_DATE}
                    className="picker"
                    mode="date"
                    onChange={(e) => this.onSpaceDateChange(e)}
                  >
                    <View className="date">
                      <View className="info">
                        <View className="day">{isNow ? '今天' : ''}</View>
                        <View>{spaceDate.replace(/-/g, '.').substring(5, 10)}</View>
                      </View>
                      <AtIcon value="chevron-down" size="24" color="#101010"></AtIcon>
                    </View>
                  </Picker>
                </View>
              )}

              <View className="people-panel">
                {matchList.length > 0 &&
                  matchList.map((match, index) => {
                    return (
                      <View className="panel">
                        <View className="p-top" onClick={() => this.handlePeoPleOpen(index)}>
                          <View className={match.isDone || match.isCancel ? 'info disabled' : 'info'}>
                            <View>
                              <Text className="text">
                                {match.startAt} - {match.endAt}
                              </Text>{' '}
                              / <Text className="text">{match.duration}小时</Text> /{' '}
                              <Text className="text">{match.selectPeople}</Text>
                              <Text className="text">/</Text>
                              <Text className="text">{match.totalPeople}人</Text>
                            </View>
                            {match.selectPeople === match.totalPeople ? (
                              <View className="tips2">满</View>
                            ) : (
                              match.rebate !== 10 && <View className="tips1">折</View>
                            )}
                          </View>
                          <AtIcon
                            className={openList[index] ? '' : 'open'}
                            value="chevron-down"
                            size="24"
                            color={match.isDone || match.isCancel ? '#ccc' : '#101010'}
                          ></AtIcon>
                        </View>
                        <View className={openList[index] ? 'list' : 'list hidden'}>
                          {personList?.length > 0 &&
                            personList.map((item, index) => {
                              const flag = index + 1 === currentMatch.minPeople;
                              const isPrev = index + 2 === currentMatch.minPeople;
                              const isOdd = currentMatch.minPeople % 2;
                              let className = 'item';
                              if (flag) {
                                className += isOdd ? ' odd-line' : ' even-line';
                              } else if (isPrev && !isOdd) {
                                className += ' pre-line';
                              }
                              if (selectList.includes(index)) {
                                className += ' hover';
                              }
                              return (
                                <View className={className} onClick={() => this.handleSelectPerson(item, index)}>
                                  <View className="img">
                                    {item.avatarUrl ? (
                                      <Image src={item.avatarUrl}></Image>
                                    ) : (
                                      <View className="index">{index + 1}</View>
                                    )}
                                  </View>
                                  {item.nickName ? (
                                    <View className="name">{item.nickName}</View>
                                  ) : (
                                    !selectList.includes(index) && (
                                      <View className="name default">
                                        {match.isDone ? '已结束' : match.isCancel ? '组队失败' : '点击报名'}
                                      </View>
                                    )
                                  )}
                                  {selectList.includes(index) && (
                                    <View className="icon">
                                      <AtIcon value="check" size="24" color="#0092FF"></AtIcon>
                                    </View>
                                  )}
                                  {flag && <View className="tips">满{currentMatch.minPeople}人即可开赛</View>}
                                </View>
                              );
                            })}
                        </View>
                      </View>
                    );
                  })}
              </View>
            </AtTabsPane>
            <AtTabsPane current={tabValue} index={1}>
              <View className="details">
                <View className="row" style="border-bottom: 1px solid #F2F2F2">
                  <View className="icon">
                    <AtIcon value="iphone" color="#A4AAAE" size="20"></AtIcon>
                  </View>
                  <View className="label">电话</View>
                  <View className="info">
                    <Text
                      onClick={() => this.handleCallPhone(stadiumInfo?.phoneNum)}
                      style="color: #0092FF; padding-right: 16px"
                    >
                      {stadiumInfo?.phoneNum}
                    </Text>
                  </View>
                </View>
                <View className="row">
                  <View className="icon">
                    <AtIcon value="map-pin" color="#A4AAAE" size="20"></AtIcon>
                  </View>
                  <View className="label">位置</View>
                  <View className="info">
                    <Text onClick={() => this.showMap()}>{stadiumInfo?.address}</Text>
                  </View>
                </View>
                <View className="row flex-start" style="margin-top: 16px">
                  <View className="icon icon-space"></View>
                  <View className="label">场地</View>
                  <View className="info">
                    <View className="text">{stadiumInfo?.remarks}</View>
                  </View>
                </View>
                <View className="row flex-start" style="margin-top: 16px; align-items: flex-start;">
                  <View className="icon icon-detail">
                    <AtIcon value="volume-plus" color="#A4AAAE" size="20"></AtIcon>
                  </View>
                  <View className="label">说明</View>
                  <View className="info" style="transform: translateY(-7px);">
                    <AtTextarea
                      disabled
                      count={false}
                      maxLength={200}
                      value={stadiumInfo?.description}
                      onChange={() => {}}
                    />
                  </View>
                </View>
              </View>
            </AtTabsPane>
          </AtTabs>
        </View>

        {tabValue === 0 && (
          <View className="pay-btn">
            <View className="warp">
              {selectList.length > 0 ? (
                <View className="info">
                  <View className="text">
                    已选人数：
                    <Text style="font-weight： bold;">{selectList.length}</Text>
                    ，共：
                  </View>
                  <View className="money">
                    <View className="new">
                      {currency(selectList.length * currentMatch.price).multiply(currentMatch.rebate / 10).value}
                    </View>
                    {currentMatch.rebate !== 10 && (
                      <View className="old">
                        <Text className="price">{selectList.length * currentMatch.price}</Text>
                        <View className="tips1">{currentMatch.rebate}折</View>
                      </View>
                    )}
                  </View>
                </View>
              ) : orderId ? (
                <View
                  className="cancel-warp"
                  onClick={() => {
                    this.handleCancel(true);
                  }}
                >
                  <View className="cancel-icon"></View>
                  <View>取消报名</View>
                </View>
              ) : (
                <View className="not-login">
                  <View className="text">
                    当前报名人数：
                    {currentMatch?.selectPeople && (
                      <Text style="font-weight： bold;">{selectList.length + currentMatch?.selectPeople}</Text>
                    )}
                  </View>
                  <View className="tips">报满{currentMatch?.minPeople}人即可组队成功</View>
                </View>
              )}
            </View>
            <View
              onClick={this.handleThrottle(this.handleSubmit)}
              className={selectList.length ? 'btn' : 'btn disabled'}
            >
              {currentMatch.totalPeople && currentMatch.selectPeople === currentMatch.totalPeople
                ? '已满员'
                : `${orderId ? '追加' : '立即'}报名`}
            </View>
          </View>
        )}

        {cancelDialog && (
          <View className="cancel-dialog">
            <View className="panel">
              <View className="top"></View>
              <View className="dialog-body">
                <View className="content">
                  <View className="title">您要取消报名吗？</View>
                  <View className="details">
                    为防止部分用户报名后恶意取消，导致场次解散，影响队友的组队体验，特制定以下规则:
                  </View>
                  <View className="row">1、关于用户主动取消的退款规则：</View>
                  <View className="row sub">距开场小于2小时，退款0;</View>
                  <View className="row sub">距开场大于2小时，小于4小时，退款50%;</View>
                  <View className="row sub">距开场大于4小时，小于8小时，退款80%;</View>
                  <View className="row sub">距开场大于8小时，可全额退款。</View>
                  <View className="row">2、月卡用户可随时无责取消订单，但不支持退款。</View>
                </View>
                <View className="btn-list">
                  <View className="btn cancel" onClick={this.handleThrottle(this.handleRefund)}>
                    <View>坚持取消</View>
                    <View className="tips">可退￥{refundInfo.refundAmount}</View>
                  </View>
                  <View
                    className="btn confirm"
                    onClick={() => {
                      this.handleCancel(false);
                    }}
                  >
                    <View>不抛弃队友</View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <AuthorizeUserBtn authorize={authorize} onChange={(value) => this.handleAuthorize(value)}></AuthorizeUserBtn>
      </View>
    );
  }
}

export default StadiumPage;
