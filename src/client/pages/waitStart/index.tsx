import React, { Component } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { AtCurtain, AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

import TabBarStore from '@/store/tabbarStore';
import LoginStore from '@/store/loginStore';
import { inject, observer } from 'mobx-react';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import * as LoginService from '@/services/loginService';
import { SERVER_PROTOCOL, SERVER_DOMAIN } from '@/src/config';
import { setGlobalData } from '@/utils/globalData';
import * as LocalService from '@/services/localService';

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
  previewImage: boolean;
  files: any[];
  searchList: any[];
}

interface InjectStoreProps {
  tabBarStore: TabBarStore;
  loginStore: LoginStore;
}

const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const statusMap = {
  '0': '待付款',
  '1': '已成团',
  '2': '待成团',
  '3': '进行中',
};

@inject('tabBarStore', 'loginStore')
@observer
class WaitStartPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      headerPosition: {},
      searchValue: '',
      isWatch: false,
      isRecommend: true,
      stadiumList: [],
      waitStartList: [],
      userId: '',
      authorize: false,
      userLocation: false,
      authFail: false,
      latitude: '',
      longitude: '',
      previewImage: false,
      files: [],
      searchList: [],
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentWillMount() {
    Taro.getSetting().then(async (res) => {
      const userLocation = res?.authSetting['scope.userLocation'];
      if (!userLocation) {
        await this.authorizeLocal();
      } else {
        await this.getLocalInfo();
      }
    });
  }

  componentWillUnmount() {
    setGlobalData('pageCtx', '');
  }

  async getLocalInfo() {
    await Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        this.setState(
          {
            userLocation: true,
            latitude,
            longitude,
          },
          () => {
            this.getStadium(1);
          }
        );
      },
      fail: async () => {
        await LocalService.handleAuthorizeLocal(false, this.handleLocalCallback);
      },
    });
  }

  async componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
    setGlobalData('pageCtx', this);
    await this.setHeaderPosition();
    this.setState({
      isWatch: false,
      searchValue: '',
      isRecommend: true,
    });
    const userInfo = Taro.getStorageSync('userInfo') || {};
    if (userInfo?.id) {
      await this.getWaitStartList();
      await this.setState({
        userId: userInfo.id,
      });
    }
    if (this.state.userLocation) {
      this.getStadium(1);
    }
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
    }).then(async (res: any) => {
      await this.setState({
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
      const stadiumListSort = this.handleStadiumSort(res);
      // if ()
      this.setState({
        stadiumList: stadiumListSort,
      });
    });
  }

  handleSearchChange() {
    const { searchValue } = this.state;
    if (!searchValue) {
      this.setState({
        searchList: [],
      });
      return;
    }
    requestData({
      method: 'POST',
      api: '/stadium/findByName',
      params: {
        stadiumName: searchValue,
      },
    }).then(async (res: any) => {
      if (!res?.length) {
        await Taro.showToast({
          icon: 'none',
          title: '暂无搜索的场馆',
        });
        return;
      }
      this.setState({
        searchList: res,
      });
    });
  }

  setSearchValue(value) {
    this.setState({
      searchValue: value,
    });
  }

  async handleSelectType(type, flag) {
    const { isWatch, isRecommend, userId, stadiumList } = this.state;
    if (type === 1) {
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
                  this.handleSelectType(type, false);
                }
              );
            }
          },
        });
        return;
      }
      if (flag === isWatch) return;
      this.setState({
        isWatch: !isWatch,
        searchList: [],
      });
      this.getStadium(isWatch ? 1 : 2);
    } else if (type === 2) {
      if (flag === isRecommend) return;
      const stadiumListSort = this.handleStadiumSort(stadiumList);
      this.setState({
        isRecommend: !isRecommend,
        searchList: [],
        stadiumList: stadiumListSort,
      });
    }
  }

  handleStadiumSort(stadiumList) {
    const { longitude, latitude } = this.state;
    const stadiumListSort = stadiumList.sort((a, b) => {
      const distanceA = this.calcDistance(longitude, latitude, a.longitude, a.latitude);
      const distanceB = this.calcDistance(longitude, latitude, b.longitude, b.latitude);
      return distanceA - distanceB;
    });
    return stadiumListSort;
  }

  handleStadiumSortMatch() {}

  async jumpStadium(id) {
    await Taro.navigateTo({
      url: `/client/pages/stadium/index?stadiumId=${id}`,
    });
  }

  async jumpOrder(status) {
    await Taro.navigateTo({
      url: `/client/pages/order/index?index=${[1, 2].includes(status) ? 1 : status === 0 ? 0 : 2}`,
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
      async () => {
        await this.getWaitStartList();
        if (this.state.userLocation) {
          this.getStadium(1);
        }
      }
    );
  }

  async authorizeLocal() {
    await LocalService.authorizeLocal(this, this.handleLocalCallback);
  }

  handleLocalCallback = async () => {
    this.getWaitStartList();
    await this.getLocalInfo();
  };

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

  onImageClick(flag, files = []) {
    this.setState({
      previewImage: flag,
      files,
    });
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
      previewImage,
      files,
      searchList,
    } = this.state;

    const showList = searchList.length ? searchList : stadiumList;

    const {
      loginStore: { userId },
    } = this.inject;
    if (userId) {
      this.loginInit(userId);
    }

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
              onChange={(value) => this.setSearchValue(value)}
              onBlur={() => this.handleSearchChange()}
            />
          </View>
        </View>
        <View className="my-match">
          {waitStartList?.length ? (
            <Swiper
              className="swiper-wrapper"
              indicatorColor="#999"
              indicatorActiveColor="#0080ff"
              indicatorDots
              autoplay
            >
              {waitStartList.map((item) => {
                return (
                  <SwiperItem>
                    <View className="panel" onClick={() => this.jumpOrder(item.isStart)}>
                      <View className="title">我的场次</View>
                      <View className="info">
                        <Image src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}${item.stadiumUrls[0].path}`} className="logo" />
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
                            <View className={item.isStart ? (item.isStart === 3 ? 'tag run' : 'tag wait') : 'tag pay'}>
                              {statusMap[item.isStart]}
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
              <View className={isWatch ? 'item' : 'active item'} onClick={() => this.handleSelectType(1, false)}>
                全部
              </View>
              <View className={isWatch ? 'active item' : 'item'} onClick={() => this.handleSelectType(1, true)}>
                收藏
              </View>
            </View>
            <View className="right">
              <View className={isRecommend ? 'active item' : 'item'} onClick={() => this.handleSelectType(2, true)}>
                推荐
              </View>
              <View className={isRecommend ? 'item' : 'active item'} onClick={() => this.handleSelectType(2, false)}>
                距离
              </View>
            </View>
          </View>

          <View className="stadium-list">
            {userLocation ? (
              showList?.length ? (
                showList.map((item) => {
                  const distance = this.calcDistance(longitude, latitude, item.longitude, item.latitude);
                  return (
                    <View className="item">
                      <View
                        className="logo"
                        onClick={() => {
                          this.onImageClick(true, item.stadiumUrls);
                        }}
                      >
                        <Image src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}${item.stadiumUrls[0].path}`} className="img" />
                        <View className="count">{item.stadiumUrls.length}</View>
                      </View>
                      <View className="info" onClick={() => this.jumpStadium(item.id)}>
                        <View className="name">{item.name}</View>
                        <View>
                          <Text className="address">[{item.district}]</Text>
                          <Text className="num">
                            {distance >= 1000 ? `${(distance / 1000).toFixed(2)}km` : `${distance}m`}
                          </Text>
                        </View>
                      </View>
                      <View className="money" onClick={() => this.jumpStadium(item.id)}>
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

        <AtCurtain
          isOpened={previewImage}
          closeBtnPosition="top-right"
          onClose={() => {
            this.onImageClick(false);
          }}
        >
          <Swiper
            indicatorColor="#999"
            indicatorActiveColor="#0080ff"
            circular
            indicatorDots
            className="swiper-wrapper"
          >
            {files.map((item) => {
              return (
                <SwiperItem className="swiper-wrapper">
                  <Image
                    src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}${item.path}`}
                    mode="aspectFit"
                    className="img"
                  ></Image>
                </SwiperItem>
              );
            })}
          </Swiper>
        </AtCurtain>

        <AuthorizeUserBtn authorize={authorize} onChange={(value) => this.handleAuthorize(value)}></AuthorizeUserBtn>
      </View>
    );
  }
}

export default WaitStartPage;
