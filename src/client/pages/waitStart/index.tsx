import React, { Component } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { AtCurtain, AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import * as LoginService from '@/services/loginService';
import { SERVER_PROTOCOL, SERVER_DOMAIN } from '../../../config';

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
}

const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const statusMap = {
  '0': '待付款',
  '1': '已成团',
  '2': '待成团',
  '3': '进行中',
};

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
    }).then((res: any) => {
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
        searchList: [],
      });
      this.getStadium(isWatch ? 1 : 2);
    } else if (type === 2) {
      this.setState({
        isRecommend: !isRecommend,
        searchList: [],
      });
    }
  }

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
          <Swiper indicatorColor="#999" indicatorActiveColor="#0080ff" circular indicatorDots autoplay>
            {files.map((item) => {
              return (
                <SwiperItem className="swiper-wrapper">
                  <Image src={`${SERVER_PROTOCOL}${SERVER_DOMAIN}${item.path}`} className="img"></Image>
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
