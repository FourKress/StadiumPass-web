import React, { Component } from 'react';
import { View, Text, Image, Picker, Swiper, SwiperItem } from '@tarojs/components';
import { AtTabs, AtIcon, AtTabsPane, AtTextarea, AtNoticebar } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import AuthorizePhoneBtn from '@/components/authorizePhoneBtn';
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
import { updateReady } from '@/services/updateService';

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
  userInfo: any;
  refundDetails: any;
  overdue: boolean;
}

interface InjectStoreProps {
  loginStore: LoginStore;
}

const tabList = [{ title: '报名/包场' }, { title: '场馆介绍' }];
const currentDay = () => dayjs().format('YYYY-MM-DD');

@inject('loginStore')
@observer
class StadiumPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = { ...this.initData(), headerPosition: {}, userInfo: {} };
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
      refundDetails: [],
      overdue: false,
    };
  }

  async componentWillMount() {
    updateReady();
    await this.setHeaderPosition();
    // @ts-ignore
    const pageParams = await Taro.getCurrentInstance().router.params;
    const id = pageParams.stadiumId + '';
    const matchId = pageParams.matchId;
    const orderId = pageParams?.orderId;
    const runDate = pageParams?.runDate;
    const spaceId = pageParams?.spaceId;
    const userInfo = Taro.getStorageSync('userInfo') || {};
    await this.setState({
      ...this.initData(),
      stadiumId: id,
      orderId,
      spaceId,
      matchId,
      userInfo,
    });
    if (!id) return;
    this.getStadiumInfo(id);
    await this.getUnitList();
    if (!orderId) {
      if (runDate && runDate !== currentDay()) {
        if (dayjs().diff(runDate, 'day') > 5) {
          this.setState({
            overdue: true,
          });
        } else {
          await this.onSpaceDateChange({
            detail: {
              value: runDate,
            },
          });
        }
      } else {
        await this.getSpace(id, currentDay());
      }
    } else {
      this.getOrderMatch(matchId);
    }
    const userId = userInfo?.id || '';
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
    }).then(async (res: any) => {
      this.setState({
        stadiumInfo: res,
      });
      const day = dayjs().day();
      const { noticeStatus, noticeContent } = res;
      if (noticeStatus) {
        const storageKey = `notice_${id}`;
        const oldNotice = JSON.parse(Taro.getStorageSync(storageKey) || '{}')[day];
        if (!oldNotice || (noticeStatus && noticeContent !== oldNotice)) {
          Taro.setStorageSync(
            storageKey,
            JSON.stringify({
              [day]: noticeContent,
            })
          );
          await this.openNotice(noticeContent);
        }
      }
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
          title: '暂无组队场次或包场，请重新选择其它日期。',
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
      const matchList = res.filter((r) => r.type === 1).concat(res.filter((r) => r.type === 0));
      const openIndex = matchList.findIndex((d) =>
        matchId ? d.id === matchId : !d.isDone && !d.isCancel && d.type === 0
      );
      const openList = matchList.map(() => false);
      const currentMatch = matchList[openIndex] || matchList.reverse()[0];
      openList[openIndex] = true;
      this.setState({
        matchList,
        openList,
        spaceActive: index,
        currentMatch,
        selectList: [],
        matchId: '',
        openIndex,
      });

      if (currentMatch.chargeModel === 1) {
        await Taro.showModal({
          title: '平摊收费',
          content: '平摊球费 多交多退',
          showCancel: false,
        });
      }

      await this.getPeoPelList(currentMatch);
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
      const { totalPeople } = currentMatch;
      if (res.length >= totalPeople) {
        list = res;
      } else {
        if (currentMatch.type === 1) {
          const { startAt, interval } = currentMatch;

          const day = dayjs().format('YYYY-MM-DD');

          const personList = new Array(totalPeople).fill({}).map((item, index) => {
            const end = dayjs(`${day} ${startAt}`)
              .add((index + 1) * interval, 'hours')
              .format('YYYY-MM-DD HH:mm:ss')
              .substring(11, 16);
            const start = dayjs(`${day} ${startAt}`)
              .add(index * interval, 'hours')
              .format('YYYY-MM-DD HH:mm:ss')
              .substring(11, 16);

            const target = res.find((d) => d?.endAt === end && d?.startAt === start) || {};

            return {
              ...item,
              endAt: end,
              startAt: start,
              ...target,
            };
          });
          list = personList;
        } else {
          const personList = new Array(totalPeople).fill({}).map((item, index) => {
            if (index <= res.length - 1) return res[index];
            return item;
          });
          list = personList;
        }
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
    const { isDone, isCancel, type } = this.state.currentMatch;
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
      if (type === 1) {
        this.setState({
          selectList: [index],
        });
      } else {
        this.setState({
          selectList: [...selectList, index],
        });
      }
    } else {
      this.setState({
        selectList: selectList.filter((d) => d !== index),
      });
    }
  }

  async handlePhoneAuthSuccess() {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    this.setState({
      userInfo: {
        ...userInfo,
      },
    });
    await this.handleSubmit();
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
    const { spaceId, id, type } = currentMatch;
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
        personCount:
          type === 1 ? this.state.personList.filter((_d, index) => selectList.includes(index)) : selectList.length,
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
      if (this.state.currentMatch.type === 1) {
        Taro.showModal({
          title: '提示',
          content:
            '包场除特殊情况外不能申请退款，如遇特殊情况(不可控天气原因，政府疫情特殊管控等)需要退款可提交申请后等待管理员审核。确定申请取消吗？',
          success: async (res) => {
            if (res.confirm) {
              requestData({
                method: 'POST',
                api: '/order/applePackageRefund',
                params: {
                  orderId: this.state.orderId,
                },
              }).then(async () => {
                await Taro.showToast({
                  icon: 'none',
                  title: `取消包场成功，请耐心等待场主审核通过。`,
                });
                await this.handleRefundSuccess();
              });
            }
          },
        });
        return;
      }

      this.getRefundRules();
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

  getRefundRules() {
    requestData({
      method: 'POST',
      api: '/refundRule/checkByStadium',
      params: {
        stadiumId: this.state.stadiumId,
      },
    }).then((res: any) => {
      const rules = res?.rules || [];
      this.setState({
        refundDetails: rules,
      });
    });
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

  async openNotice(noticeContent) {
    if (!noticeContent) return;
    await Taro.showModal({
      title: '公告',
      content: noticeContent,
      showCancel: false,
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
      userInfo,
      refundDetails,
      overdue,
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

          {stadiumInfo?.noticeStatus && stadiumInfo?.noticeContent && (
            <View className="notice-panel">
              <View className="notice-content" onClick={() => this.openNotice(stadiumInfo?.noticeContent)}>
                <AtNoticebar icon="volume-plus" marquee single showMore moreText="">
                  {stadiumInfo.noticeContent}
                </AtNoticebar>
                <View className="label">公告</View>
              </View>
            </View>
          )}

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
                            {!overdue && (
                              <View>
                                {item.full ? (
                                  <View className="tips2">满</View>
                                ) : (
                                  item.rebate !== 10 && <View className="tips1">折</View>
                                )}
                              </View>
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

              {overdue ? (
                <AtTabsPane current={tabValue} index={0}>
                  <View className="overdue">抱歉！已过期，请重新选择日期</View>
                </AtTabsPane>
              ) : (
                <View className="people-panel">
                  {matchList.length > 0 &&
                    matchList.map((match, index) => {
                      return match.type === 1 ? (
                        <View className="panel">
                          <View className="p-top" onClick={() => this.handlePeoPleOpen(index)}>
                            <View className={match.isDone ? 'info disabled' : 'info'}>
                              <View className="tag">包</View>&nbsp;
                              <View className="text">订整场</View>&nbsp;/&nbsp;
                              <View className="text">每场价格￥{match.price}</View>
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
                              color="#101010"
                            ></AtIcon>
                          </View>

                          <View className={openList[index] ? 'list' : 'list hidden'}>
                            {personList?.length > 0 &&
                              personList.map((item, index) => {
                                let className = 'item';
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
                                      <View className="name-wrap">
                                        <View className="name">{item.nickName}</View>
                                        <View className="timer">
                                          {item.startAt}-{item.endAt}
                                        </View>
                                      </View>
                                    ) : (
                                      !selectList.includes(index) && (
                                        <View className="name-wrap">
                                          <View className="name default">
                                            {item.startAt}-{item.endAt}
                                          </View>
                                        </View>
                                      )
                                    )}
                                    {selectList.includes(index) && (
                                      <View className="name-wrap">
                                        <View className="name" style="color: #0080ff">
                                          {item.startAt}-{item.endAt}
                                        </View>
                                      </View>
                                    )}
                                  </View>
                                );
                              })}
                          </View>
                        </View>
                      ) : (
                        <View className="panel">
                          <View className="p-top" onClick={() => this.handlePeoPleOpen(index)}>
                            <View className={match.isDone || match.isCancel ? 'info disabled' : 'info'}>
                              <View className="tag">散</View>&nbsp;
                              <Text className="text">
                                {match.startAt}-{match.endAt}
                              </Text>
                              &nbsp;/&nbsp;<Text className="text">{match.duration}小时</Text>&nbsp;/&nbsp;
                              <Text className="text">{match.selectPeople}</Text>
                              <Text className="text">/</Text>
                              <Text className="text">{match.totalPeople}人</Text>
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
                                      <View className="name-wrap">
                                        <View className="name">{item.nickName}</View>
                                        {item.isMonthlyCardPay && <View className="tag"></View>}
                                      </View>
                                    ) : (
                                      !selectList.includes(index) && (
                                        <View className="name-wrap">
                                          <View className="name default">
                                            {match.isCancel ? '组队失败' : match.isDone ? '已结束' : '点击报名'}
                                          </View>
                                        </View>
                                      )
                                    )}
                                    {selectList.includes(index) && (
                                      <View className="icon">
                                        <AtIcon value="check" size="24" color="#0092FF"></AtIcon>
                                      </View>
                                    )}
                                    {flag && (
                                      <View className="tips">
                                        满{currentMatch.minPeople}人即可开赛，人数不足自动退款
                                      </View>
                                    )}
                                  </View>
                                );
                              })}
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}
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

        {!overdue && tabValue === 0 && (
          <View className="pay-btn">
            <View className="warp">
              {selectList.length > 0 ? (
                <View className="info">
                  <View className="text left-text">
                    <View className="row-left">
                      <Text>
                        已选{currentMatch.type === 1 ? '时段' : '人数'}：
                        <Text style="font-weight： bold;">{selectList.length}</Text>，
                      </Text>
                      {currentMatch.chargeModel === 1 && <Text className="pre">本次预支付</Text>}
                    </View>
                    <View className="row-right">共：</View>
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
                  <View>取消{currentMatch.type === 1 ? '包场' : '报名'}</View>
                </View>
              ) : currentMatch.type === 1 ? (
                <View className="not-login">
                  <View className="text">
                    当前包场时段：
                    <Text style="font-weight： bold;">{selectList.length}</Text>
                  </View>
                  <View className="tips">选择一个包场时段即可进行包场</View>
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
            {selectList.length && this.state.userId && !userInfo?.phoneNum ? (
              <View className={selectList.length ? 'btn' : 'btn disabled'}>
                <AuthorizePhoneBtn onAuthSuccess={() => this.handlePhoneAuthSuccess()}>
                  {currentMatch.totalPeople && currentMatch.selectPeople === currentMatch.totalPeople
                    ? `已${currentMatch.type === 1 ? '包满' : '满员'}`
                    : `${orderId ? '追加' : `${currentMatch.chargeModel === 1 ? '平摊模式' : '立即'}`}${
                        currentMatch.type === 1 ? '包场' : '报名'
                      }`}
                </AuthorizePhoneBtn>
              </View>
            ) : (
              <View
                onClick={this.handleThrottle(this.handleSubmit)}
                className={selectList.length ? 'btn' : 'btn disabled'}
              >
                {currentMatch.totalPeople && currentMatch.selectPeople === currentMatch.totalPeople
                  ? `已${currentMatch.type === 1 ? '包满' : '满员'}`
                  : `${orderId ? '追加' : `${currentMatch.chargeModel === 1 ? '平摊模式' : '立即'}`}${
                      currentMatch.type === 1 ? '包场' : '报名'
                    }`}
              </View>
            )}
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
                  {refundDetails.map((d) => {
                    return (
                      <View className="row sub">
                        距开场小于{d.refundTime}小时，退款{d.refundRatio * 100}%;
                      </View>
                    );
                  })}
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
