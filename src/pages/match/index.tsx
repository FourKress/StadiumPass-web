import React, { Component } from 'react';
import { Picker, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';
// import requestData from '@/utils/requestData';

import './index.scss';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';
import dayjs from 'dayjs';
import requestData from '@/utils/requestData';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IState {
  tabPosition: object;
  stadiumList: Array<any>;
  stadiumInfo: any;
  selectDate: any;
  matchList: Array<any>;
}

const weekMap = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};
const DATA_LIST = Array(7)
  .fill('')
  .map((d, index) => {
    const currentDay = dayjs().add(index, 'day');
    const date = currentDay.format('YYYY.MM.DD');
    const dateArr = date.split('.');
    d = {
      year: dateArr[0],
      month: dateArr[1],
      day: dateArr[2],
      week: weekMap[currentDay.day()],
    };
    return d;
  });

const dateNow = dayjs().format('YYYY-MM-DD');

@inject('tabBarStore')
@observer
class MatchPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      tabPosition: {},
      stadiumList: [],
      stadiumInfo: {},
      selectDate: DATA_LIST[0],
      matchList: [],
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }
  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
    this.setMeBtnPosition();
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (userInfo?.bossId) {
      this.getStadiumList();
    }
  }

  setMeBtnPosition() {
    // 接收状态栏高度
    let stateHeight = 0;
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const top = menuButton.top - stateHeight; //  获取top值
    const { height } = menuButton;
    this.setState({
      tabPosition: {
        top: stateHeight + top + (height - 26) / 2,
      },
    });
  }

  getStadiumList() {
    requestData({
      method: 'GET',
      api: '/stadium/stadiumList',
    }).then((res: any) => {
      const stadiumInfo = res[0];
      this.getMatchList(stadiumInfo.id, dateNow);
      this.setState({
        stadiumList: res,
        stadiumInfo: stadiumInfo,
      });
    });
  }

  getMatchList(stadiumId, runDate) {
    requestData({
      method: 'POST',
      api: '/match/runList',
      params: {
        stadiumId,
        runDate,
      },
    }).then((res: any) => {
      this.setState({
        matchList: res,
      });
    });
  }

  handleSelect(e) {
    const index = e.detail.value;
    const stadium = this.state.stadiumList[index];
    this.setState({
      stadiumInfo: stadium,
      selectDate: DATA_LIST[0],
    });
    this.getMatchList(stadium.id, dateNow);
  }

  handleSelectDate(index) {
    const target = DATA_LIST[index];
    const { year, month, day } = target;
    this.setState({
      selectDate: target,
    });
    const { stadiumInfo } = this.state;
    this.getMatchList(stadiumInfo.id, `${year}-${month}-${day}`);
  }

  jumpDetails(item) {
    Taro.navigateTo({
      url: `../match-details/index?matchId=${item.id}&stadiumId=${item.stadiumId}`,
    });
  }

  render() {
    const { stadiumList, tabPosition, selectDate, stadiumInfo, matchList } = this.state;

    return (
      <View className="match-page">
        <View className="top-bar">
          <Picker mode="selector" rangeKey="name" range={stadiumList} onChange={(e) => this.handleSelect(e)}>
            <View className="bar" style={tabPosition}>
              <Text>{stadiumInfo.name}</Text>
              <AtIcon value="chevron-down" size="20" color="#000"></AtIcon>
            </View>
          </Picker>
        </View>
        <View className="date-list">
          <View className="scroll-warp">
            {DATA_LIST.map((date, index) => {
              return (
                <View
                  className={selectDate?.day === date.day ? 'item active' : 'item'}
                  onClick={() => this.handleSelectDate(index)}
                >
                  <View className="week">{date.week}</View>
                  <View className="time">
                    {date.month}.{date.day}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {matchList.length > 0 ? (
          <View className="list">
            <View className="scroll-warp">
              {matchList.map((item) => {
                return (
                  <View className="item" onClick={() => this.jumpDetails(item)}>
                    <View className="top">
                      <View className="left">{item.repeatModel === 1 ? '单次场次' : '重复场次'}</View>
                      <View className="right">
                        {item.status ? (
                          <Text>已报名：{item.selectPeople}人</Text>
                        ) : (
                          <Text style="color: #ff0000">本场已取消</Text>
                        )}
                        {item.status && (
                          <View className="share">
                            <AtIcon value="share" size="14" color="#0080FF"></AtIcon>
                            <Text>分享</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="item-body">
                      <View>场地：{item.space?.name}</View>
                      <View>
                        时间：{item.repeatName} / {item.startAt}-{item.endAt}
                      </View>
                      <View>时长：{item.duration}小时</View>
                      <View>
                        人数：最少{item.minPeople}人 / 最多{item.totalPeople}人
                      </View>
                      <View>价格：￥{item.rebatePrice}每人</View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="not-data" style="margin-top: 32px">
            暂无数据
          </View>
        )}
      </View>
    );
  }
}

export default MatchPage;
