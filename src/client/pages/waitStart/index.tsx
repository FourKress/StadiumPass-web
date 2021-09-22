import React, { Component } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { AtIcon, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

import TabBarStore from '@/store/tabbarStore';
import { inject, observer } from 'mobx-react';

interface IState {
  headerPosition: any;
  searchValue: string;
  isWatch: boolean;
  isRecommend: boolean;
  stadiumList: any[];
  waitStartList: any[];
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
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
    this.setHeaderPosition();
    this.getWaitStartList();
    this.getStadium(1);
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
    requestData({
      method: 'POST',
      api: '/stadium/waitStartList',
      params: {
        type,
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

  handleSelectType(type) {
    const { isWatch, isRecommend } = this.state;
    if (type === 1) {
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

  render() {
    const { headerPosition, searchValue, isWatch, isRecommend, stadiumList, waitStartList } = this.state;

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
            {stadiumList?.length ? (
              stadiumList.map((item) => {
                return (
                  <View className="item" onClick={() => this.jumpStadium(item.id)}>
                    <View className="logo">
                      <Image src={item.stadiumUrl} className="img" />
                      <View className="count">5</View>
                    </View>
                    <View className="info">
                      <View className="name">{item.name}</View>
                      <View>
                        <Text className="address">[{item.city}]</Text>
                        <Text className="num">111m</Text>
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
            )}
          </View>
        </View>
      </View>
    );
  }
}

export default WaitStartPage;
