import React, { Component } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import * as LoginService from '@/services/loginService';

interface IState {
  headerPosition: any;
  searchValue: string;
  isWatch: boolean;
  isRecommend: boolean;
  stadiumList: any[];
  waitStartList: any[];
  userId: string;
  authorize: boolean;
  userLocation: boolean;
  authFail: boolean;
  latitude: number | '';
  longitude: number | '';
}

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

@inject('tabBarStore')
@observer
class WaitStartPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      headerPosition: {},
      searchValue: '',
      isWatch: false,
      isRecommend: false,
      stadiumList: [],
      waitStartList: [],
      userId: '',
      authorize: false,
      userLocation: false,
      authFail: false,
      latitude: '',
      longitude: '',
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentWillMount() {
    Taro.getSetting().then((res) => {
      const userLocation = res?.authSetting['scope.userLocation'];
      console.log(userLocation);
      Taro.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res;
          this.setState(
            {
              userLocation: !!userLocation,
              latitude,
              longitude,
            },
            () => {
              this.getStadium(1);
            }
          );
        },
      });
    });
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
    this.setHeaderPosition();
    this.setState({
      isWatch: false,
      searchValue: '',
      isRecommend: false,
      authFail: false,
    });
    const userInfo = Taro.getStorageSync('userInfo') || {};
    if (userInfo?.id) {
      this.getWaitStartList();
      this.setState({
        userId: userInfo.id,
      });
    }
    if (this.state.userLocation) {
      this.getStadium(1);
    }
  }

  setHeaderPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const top = menuButton.top - stateHeight; //  获取top值
    const { height } = menuButton;

    this.setState({
      headerPosition: {
        top: stateHeight + top,
        height,
        borderRadius: height,
      },
    });
  }

  getWaitStartList() {
    requestData({
      method: 'GET',
      api: '/match/waitStartList',
    }).then((res: any) => {
      this.setState({
        waitStartList: res,
      });
    });
  }

  getStadium(type) {
    if (!this.state.userLocation) {
      return;
    }
    const { userId } = this.state;
    requestData({
      method: 'POST',
      api: '/stadium/waitStartList',
      params: {
        type,
        userId,
      },
    }).then((res: any) => {
      this.setState({
        stadiumList: res,
      });
    });
  }

  handleSearchChange(value) {
    this.setState({
      searchValue: value,
    });
  }

  async handleSelectType(type) {
    const { isWatch, isRecommend, userId } = this.state;
    if (type === 1) {
      console.log(isWatch, userId);
      if (!isWatch && !userId) {
        await Taro.showModal({
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
                  this.getWaitStartList();
                  this.handleSelectType(type);
                }
              );
            }
          },
        });
        return;
      }
      this.setState({
        isWatch: !isWatch,
      });
      this.getStadium(isWatch ? 1 : 2);
    } else if (type === 2) {
      this.setState({
        isRecommend: !isRecommend,
      });
    }
  }

  async jumpStadium(id, matchId?: string) {
    await Taro.navigateTo({
      url: `/client/pages/stadium/index?stadiumId=${id}&isStart=${!!matchId}&matchId=${matchId}`,
    });
  }

  async handleAuthorize(status) {
    if (!status) {
      this.setState({
        authorize: status,
      });
      return;
    }
    const userInfo: any = await LoginService.handleAuthorize();
    this.setState({
      userId: userInfo.id,
      authorize: false,
    });
  }

  authorizeLocal() {
    Taro.authorize({
      scope: 'scope.userLocation',
    })
      .then(async () => {
        await this.handleAuthorizeLocal(true);
      })
      .catch(async ({ errMsg }) => {
        if (errMsg.includes('authorize:fail') && this.state.authFail) {
          await Taro.showModal({
            title: '授权提示',
            content: '授权获取位置信息，查看您附近的球场',
            confirmText: '去设置',
            success: async (res) => {
              if (res.confirm) {
                await Taro.openSetting({
                  success: (res) => {
                    const userLocation = res.authSetting['scope.userLocation'];
                    if (!userLocation) {
                      this.handleAuthorizeLocal(false);
                      return;
                    }
                    this.handleAuthorizeLocal(!!userLocation);
                  },
                });
              } else {
                await this.handleAuthorizeLocal(false);
              }
            },
          });
          return;
        }
        this.setState({
          authFail: true,
        });
        await this.handleAuthorizeLocal(false);
      });
  }

  async handleAuthorizeLocal(status) {
    if (!status) {
      await Taro.showToast({
        title: '授权失败',
        icon: 'none',
      });
      return;
    }
    this.getWaitStartList();
    this.setState({
      userLocation: true,
    });
  }

  calcDistance(lonA, latA, lonB, latB) {
    const earthR = 6371000;
    const x =
      Math.cos((latA * Math.PI) / 180) * Math.cos((latB * Math.PI) / 180) * Math.cos(((lonA - lonB) * Math.PI) / 180);
    const y = Math.sin((latA * Math.PI) / 180) * Math.sin((latB * Math.PI) / 180);
    let s = x + y;
    if (s > 1) s = 1;
    if (s < -1) s = -1;
    const alpha = Math.acos(s);
    const distance = parseFloat((alpha * earthR).toFixed(2));
    return distance;
  }

  render() {
    const {
      headerPosition,
      searchValue,
      isWatch,
      isRecommend,
      stadiumList,
      waitStartList,
      authorize,
      userLocation,
      latitude,
      longitude,
    } = this.state;

    return (
      <View className="wait-start-page">
        <View className="page-header" style={{ height: headerPosition.top + 44 }}>
          <View className="title" style={{ top: headerPosition.top }}>
            报名
          </View>
          <View className="search" style={headerPosition}>
            <AtIcon className="icon" value="search" size="14" color="#C7C7CC"></AtIcon>
            <AtInput
              name="search"
              type="text"
              placeholder="搜索场馆"
              placeholderClass="search-input"
              clear
              value={searchValue}
              onChange={(value) => this.handleSearchChange(value)}
            />
          </View>
        </View>
        <View className="my-match">
          {waitStartList?.length ? (
            <Swiper className="swiper-wrapper" indicatorColor="#999" indicatorActiveColor="#0080ff" indicatorDots>
              {waitStartList.map((item) => {
                return (
                  <SwiperItem>
                    <View className="panel" onClick={() => this.jumpStadium(item.stadiumId, item.id)}>
                      <View className="title">我的场次</View>
                      <View className="info">
                        <Image src={item.stadiumUrl} className="logo" />
                        <View className="details">
                          <View className="name">{item.stadiumName}</View>
                          <View className="sub">{item.stadiumAddress}</View>
                        </View>
                      </View>
                      <View className="line"></View>
                      <View className="match-info">
                        <View className="left">
                          <View className="tips">当前成员</View>
                          <View className="count">
                            <View>
                              <Text className="bold">{item.selectPeople}</Text>/{item.totalPeople}
                            </View>
                            <View className={item.isStart === 3 ? 'tag run' : 'tag wait'}>
                              {item.isStart === 1 ? '已成团' : item.isStart === 2 ? '待成团' : '进行中'}
                            </View>
                          </View>
                        </View>
                        <View className="right">
                          <View className="tips">场次时间</View>
                          <View>
                            <Text className="bold">
                              {item.startAt}-{item.endAt}
                            </Text>
                            /{item.runDate.substring(5, 10)}/{weekMap[dayjs(item.runDate).day()]}
                          </View>
                        </View>
                      </View>
                    </View>
                  </SwiperItem>
                );
              })}
            </Swiper>
          ) : (
            <View className="not-data" style="margin-top: 16px">
              暂无场次信息
            </View>
          )}
        </View>

        <View className="main">
          <View className="nav">
            <View className="left">
              <View className={isWatch ? 'item' : 'active item'} onClick={() => this.handleSelectType(1)}>
                全部
              </View>
              <View className={isWatch ? 'active item' : 'item'} onClick={() => this.handleSelectType(1)}>
                收藏
              </View>
            </View>
            <View className="right">
              <View className={isRecommend ? 'item' : 'active item'} onClick={() => this.handleSelectType(2)}>
                推荐
              </View>
              <View className={isRecommend ? 'active item' : 'item'} onClick={() => this.handleSelectType(2)}>
                距离
              </View>
            </View>
          </View>

          <View className="stadium-list">
            {userLocation ? (
              stadiumList?.length ? (
                stadiumList.map((item) => {
                  const distance = this.calcDistance(longitude, latitude, item.longitude, item.latitude);
                  return (
                    <View className="item" onClick={() => this.jumpStadium(item.id)}>
                      <View className="logo">
                        <Image src={item.stadiumUrl} className="img" />
                        <View className="count">5</View>
                      </View>
                      <View className="info">
                        <View className="name">{item.name}</View>
                        <View>
                          <Text className="address">[{item.district}]</Text>
                          <Text className="num">
                            {distance >= 1000 ? `${(distance / 1000).toFixed(2)}km` : `${distance}m`}
                          </Text>
                        </View>
                      </View>
                      <View className="money">
                        <View className="new">25</View>
                        <View className="old">
                          <View className="price">50</View>
                          <View className="tips">折</View>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className="not-data" style="margin-top: 16px">
                  暂无数据
                </View>
              )
            ) : (
              <View className="not-data authorize-local" style="margin-top: 24px" onClick={() => this.authorizeLocal()}>
                授权获取位置信息，查看您附近的球场
              </View>
            )}
          </View>
        </View>

        <AuthorizeUserBtn authorize={authorize} onChange={(value) => this.handleAuthorize(value)}></AuthorizeUserBtn>
      </View>
    );
  }
}

export default WaitStartPage;
