import React, { Component } from 'react';
import { View, Text, Image, Picker } from '@tarojs/components';
import { AtTabs, AtIcon, AtTabsPane } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import * as LoginService from '../../services/loginService';
import AuthorizeUserBtn from '../../components/authorizeUserModal';
import dayjs from 'dayjs';

import './index.scss';

const STAR_DATE = dayjs().format('YYYY.MM.DD');
const END_DATE = dayjs().add(7, 'day').format('YYYY.MM.DD');

interface IState {
  tabValue: number;
  openList: any;
  meBtbPosition: object;
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
  isStart: boolean;
  openIndex: number;
}

const tabList = [{ title: '场次报名' }, { title: '场馆介绍' }];

class StadiumPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      openList: [],
      meBtbPosition: {},
      stadiumInfo: {},
      isWatch: false,
      spaceList: [],
      matchList: [],
      userId: '',
      authorize: false,
      stadiumId: '',
      spaceActive: 0,
      currentMatch: {},
      personList: [],
      selectList: [],
      spaceDate: dayjs().format('YYYY-MM-DD'),
      isStart: false,
      openIndex: 0,
    };
  }

  async onShareAppMessage() {
    const activityId: any = await this.getActivityId();
    console.log('activityId', activityId);
    await Taro.updateShareMenu({
      isUpdatableMessage: true,
      activityId: activityId, // 活动 ID
      templateInfo: {
        parameterList: [
          {
            name: 'member_count',
            value: '1',
          },
          {
            name: 'room_limit',
            value: '3',
          },
        ],
      },
      fail: (err) => {
        console.log('err', err);
        Taro.showToast({
          icon: 'none',
          title: '分享失败',
        });
      },
    });
    return {
      title: '测试分享,自定义Title',
      imageUrl:
        'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg',
      path: '/pages/stadium/index',
    };
  }

  componentDidShow() {
    this.setMeBtnPosition();
    // @ts-ignore
    Taro.showShareMenu({
      withShareTicket: true,
      // @ts-ignore
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    console.log(pageParams);
    // const id = pageParams.stadiumId + '';
    const id = '60cda9846c449177584f9ca3';
    const matchId = pageParams.matchId;
    const isStart = !!pageParams.isStart;
    this.setState(
      {
        stadiumId: id,
        isStart,
      },
      () => {
        if (!id) return;
        this.getStadiumInfo(id);
        if (!isStart) {
          this.getSpace(id, dayjs().format('YYYY-MM-DD')).then(() => {});
        } else {
          this.getOrderMatch(matchId);
        }
        const userId = Taro.getStorageSync('userInfo').id || '';
        this.loginInit(userId);
      }
    );
  }

  getActivityId() {
    return requestData({
      method: 'GET',
      api: '/wx/getActivityId',
    }).then((res) => {
      return res;
    });
  }

  loginInit(userId) {
    this.setState(
      {
        userId,
      },
      () => {
        if (!userId) {
          return;
        }
        this.getWatchStatus(this.state.stadiumId);
      }
    );
  }

  setMeBtnPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const top = menuButton.top - stateHeight; //  获取top值
    const { width, left, height } = menuButton;
    this.setState({
      meBtbPosition: {
        left: left - 16 - 88,
        top: stateHeight + top,
        height,
        width,
        borderRadius: height,
      },
    });
  }

  getStadiumInfo(id) {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id,
      },
    }).then((res: any) => {
      console.log(res);
      this.setState({
        stadiumInfo: res,
      });
    });
  }

  getWatchStatus(stadiumId) {
    requestData({
      method: 'POST',
      api: '/userRelationStadium/watchFlag',
      params: {
        stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        isWatch: res?.isWatch,
      });
    });
  }

  getSpace(stadiumId, date) {
    return requestData({
      method: 'POST',
      api: '/space/list',
      params: {
        stadiumId,
        validateDate: date,
      },
    }).then((res: any) => {
      if (!res?.length) {
        Taro.showToast({
          icon: 'none',
          title: '选择的日期暂无组队场次，请重新选择其它日期。',
        });
        return false;
      }
      this.getMatchList(res[0]?.id, 0);
      this.setState({
        spaceList: res,
        selectList: [],
      });
      return res;
    });
  }

  async onSpaceDateChange(e) {
    const { value } = e.detail;
    if (value === this.state.spaceDate) return;
    const result = await this.getSpace(this.state.stadiumId, value);
    if (result) {
      this.setState({
        spaceDate: value,
      });
    }
  }

  getMatchList(spaceId, index) {
    requestData({
      method: 'GET',
      api: '/match/info',
      params: {
        spaceId,
      },
    }).then(async (res: any) => {
      const notDone = res.findIndex((d) => !d.isDone && !d.isCancel);
      const openList = res.map(() => false);
      openList[notDone] = true;
      this.setState({
        matchList: res,
        openList,
        spaceActive: index,
        currentMatch: res[notDone] || res.reverse()[0],
        selectList: [],
      });
      await this.getPeoPelList(res[notDone]);
    });
  }

  getOrderMatch(matchId) {
    requestData({
      method: 'POST',
      api: '/match/orderMatchInfo',
      params: {
        matchId,
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
        const personList = new Array(currentMatch.totalPeople)
          .fill({})
          .map((item, index) => {
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
    const { openList, matchList, openIndex } = this.state;
    const status = openList[index];
    if (!status) {
      if (openIndex !== index) {
        this.setState({
          selectList: [],
        });
      }
      await this.getPeoPelList(matchList[index]);
    }
    this.setState({
      openList: openList.map((open, i) => {
        open = index === i ? !open : false;
        return open;
      }),
      openIndex: index,
    });
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

  jumpCenter() {
    Taro.navigateTo({
      url: '../me/index',
    });
  }

  handleSubmit() {
    const { currentMatch, stadiumId, selectList } = this.state;
    if (selectList.length <= 0) return;
    if (currentMatch.selectPeople === currentMatch.totalPeople) return;
    if (!this.checkLogin()) return;
    const { spaceId, id } = currentMatch;
    const payAmount =
      selectList.length * currentMatch.price * (currentMatch.rebate / 10);
    return requestData({
      method: 'POST',
      api: '/order/add',
      params: {
        matchId: id,
        spaceId,
        stadiumId,
        payAmount,
        personCount: selectList.length,
      },
    }).then((res: any) => {
      console.log(res);
      this.jumpOrderPay(res);
    });
  }

  jumpOrderPay(orderId) {
    Taro.navigateTo({
      url: `../orderPay/index?orderId=${orderId}`,
    });
  }

  handleCallPhone(phoneNumber) {
    Taro.makePhoneCall({
      phoneNumber,
    });
  }

  handleWatch() {
    if (!this.checkLogin()) {
      return;
    }
    const { stadiumInfo, isWatch } = this.state;
    requestData({
      method: 'POST',
      api: '/userRelationStadium/watch',
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

  checkLogin() {
    if (!this.state.userId) {
      Taro.showModal({
        title: '提示',
        content: '您当前未登录，请先登录。',
        confirmText: '登录',
        success: async (res) => {
          if (res.confirm) {
            const userInfo: any = await LoginService.login();
            if (!userInfo) {
              this.setState({
                authorize: true,
              });
              return;
            }
            this.setState(
              {
                userId: userInfo.id,
              },
              () => {
                this.loginInit(userInfo.id);
              }
            );
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
      },
      () => {
        this.loginInit(userInfo.id);
      }
    );
  }

  render() {
    const {
      tabValue,
      openList,
      meBtbPosition,
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
      isStart,
    } = this.state;

    const isNow = !dayjs().startOf('day').diff(dayjs(spaceDate));

    return (
      <View className="stadium-page">
        <View className="page-header">
          <Image className="bg" src={stadiumInfo.stadiumUrl}></Image>
          <View
            className="me"
            style={meBtbPosition}
            onClick={() => this.jumpCenter()}
          >
            <Image className="icon" src=""></Image>
            <Text>我的</Text>
          </View>
        </View>
        <View className="main">
          <View className="top">
            <View className="left">
              <View className="name">{stadiumInfo.name}</View>
              <View className="address">
                <View className="icon"></View>
                <Text>{stadiumInfo.address}</Text>
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
              {!isStart && (
                <View className="space-panel">
                  <View className="list">
                    {spaceList.length > 0 &&
                      spaceList.map((item, index) => {
                        return (
                          <View
                            onClick={() => this.getMatchList(item.id, index)}
                            className={
                              spaceActive === index ? 'item active' : 'item'
                            }
                          >
                            <View className="type">{item.name}</View>
                            <View className="unit">{item.unit}</View>
                            {item.full ? (
                              <View className="tips2">满</View>
                            ) : (
                              item.rebate !== 1 && (
                                <View className="tips1">折</View>
                              )
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
                        <View>
                          {spaceDate.replace(/-/g, '.').substring(5, 10)}
                        </View>
                      </View>
                      <AtIcon
                        value="chevron-down"
                        size="24"
                        color="#101010"
                      ></AtIcon>
                    </View>
                  </Picker>
                </View>
              )}

              <View className="people-panel">
                {matchList.length > 0 &&
                  matchList.map((match, index) => {
                    return (
                      <View className="panel">
                        <View
                          className="p-top"
                          onClick={() => this.handlePeoPleOpen(index)}
                        >
                          <View
                            className={
                              match.isDone || match.isCancel
                                ? 'info disabled'
                                : 'info'
                            }
                          >
                            <View>
                              <Text className="text">
                                {match.startAt.split(' ')[1]} -{' '}
                                {match.endAt.split(' ')[1]}
                              </Text>{' '}
                              /{' '}
                              <Text className="text">{match.duration}小时</Text>{' '}
                              /{' '}
                              <Text className="text">{match.selectPeople}</Text>
                              <Text className="text">/</Text>
                              <Text className="text">
                                {match.totalPeople}人
                              </Text>
                            </View>
                            {match.selectPeople === match.totalPeople ? (
                              <View className="tips2">满</View>
                            ) : (
                              match.rebate !== 1 && (
                                <View className="tips1">折</View>
                              )
                            )}
                          </View>
                          <AtIcon
                            className={openList[index] ? '' : 'open'}
                            value="chevron-down"
                            size="24"
                            color={
                              match.isDone || match.isCancel
                                ? '#ccc'
                                : '#101010'
                            }
                          ></AtIcon>
                        </View>
                        <View
                          className={openList[index] ? 'list' : 'list hidden'}
                        >
                          {personList?.length > 0 &&
                            personList.map((item, index) => {
                              const flag = index + 1 === currentMatch.minPeople;
                              const isPrev =
                                index + 2 === currentMatch.minPeople;
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
                                <View
                                  className={className}
                                  onClick={() =>
                                    this.handleSelectPerson(item, index)
                                  }
                                >
                                  <View className="img">
                                    {item.avatarUrl ? (
                                      <Image src={item.avatarUrl}></Image>
                                    ) : (
                                      <View className="index">{index + 1}</View>
                                    )}
                                  </View>
                                  {item.nickName ? (
                                    <View className="name">
                                      {item.nickName}
                                    </View>
                                  ) : (
                                    !selectList.includes(index) && (
                                      <View className="name default">
                                        {match.isDone
                                          ? '已结束'
                                          : match.isCancel
                                          ? '组队失败'
                                          : '虚位以待'}
                                      </View>
                                    )
                                  )}
                                  {selectList.includes(index) && (
                                    <View className="icon">
                                      <AtIcon
                                        value="check"
                                        size="24"
                                        color="#0092FF"
                                      ></AtIcon>
                                    </View>
                                  )}
                                  {flag && (
                                    <View className="tips">
                                      满{currentMatch.minPeople}人即可开赛
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
            </AtTabsPane>
            <AtTabsPane current={tabValue} index={1}>
              <View className="details">
                <View className="row" style="border-bottom: 1px solid #F2F2F2">
                  <View className="icon"></View>
                  <View className="label">电话</View>
                  <View className="info">
                    <Text
                      onClick={() =>
                        this.handleCallPhone(stadiumInfo.firstPhoneNum)
                      }
                      style="color: #0092FF; padding-right: 16px"
                    >
                      {stadiumInfo.firstPhoneNum}
                    </Text>
                    <Text
                      onClick={() =>
                        this.handleCallPhone(stadiumInfo.secondPhoneNum)
                      }
                      style="color: #0092FF"
                    >
                      {stadiumInfo.secondPhoneNum}
                    </Text>
                  </View>
                </View>
                <View className="row">
                  <View className="icon"></View>
                  <View className="label">位置</View>
                  <View className="info">
                    <Text>{stadiumInfo.address}</Text>
                  </View>
                </View>
                <View className="row flex-start" style="margin-top: 16px">
                  <View className="icon"></View>
                  <View className="label">场地</View>
                  <View className="info">
                    <View className="text">
                      足球 - 5v5 x3；8v8 x2；11v11 x1。
                    </View>
                  </View>
                </View>
                <View className="row flex-start" style="margin-top: 16px">
                  <View className="icon"></View>
                  <View className="label">说明</View>
                  <View className="info">
                    <View>注意事项：</View>
                    <View>
                      1、报名人数不足最低开赛标准时，即组队失败。订单将自动退款,款项将在1个工作日内按原路全额退回。
                    </View>
                    <View>
                      2、关于用户主动取消订单的退款规则距开场小于1小时,无法退款;距开场大于1小时,小于2小时,退款80%;距开场大于2小时,可全额退款。
                    </View>
                    <View>3、场地月卡可随时无责取消订单,但不支持退款。</View>
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
                    已选席位：
                    <Text style="font-weight： bold;">{selectList.length}</Text>
                    ，共：
                  </View>
                  <View className="money">
                    <View className="new">
                      {selectList.length *
                        currentMatch.price *
                        (currentMatch.rebate / 10)}
                    </View>
                    <View className="old">
                      <Text className="price">
                        {selectList.length * currentMatch.price}
                      </Text>
                      <View className="tips1">{currentMatch.rebate}折</View>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="not-login">
                  <View className="text">
                    当前报名人数：
                    {currentMatch?.selectPeople && (
                      <Text style="font-weight： bold;">
                        {selectList.length + currentMatch?.selectPeople}
                      </Text>
                    )}
                  </View>
                  <View className="tips">
                    报满{currentMatch?.minPeople}人即可组队成功
                  </View>
                </View>
              )}
            </View>
            <View
              onClick={() => this.handleSubmit()}
              className={selectList.length ? 'btn' : 'btn disabled'}
            >
              {currentMatch.selectPeople === currentMatch.totalPeople
                ? '已满员'
                : `${isStart ? '追加' : '立即'}报名`}
            </View>
          </View>
        )}

        <AuthorizeUserBtn
          authorize={authorize}
          onChange={(value) => this.handleAuthorize(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default StadiumPage;
