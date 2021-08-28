import React, { Component } from 'react';
import { Picker, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';
// import requestData from '@/utils/requestData';

import './index.scss';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';
import dayjs from 'dayjs';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IState {
  tabPosition: object;
  selectList: Array<any>;
  stadiumId: string;
  selectDate: any;
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

@inject('tabBarStore')
@observer
class MatchPage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      tabPosition: {},
      selectList: [],
      stadiumId: '',
      selectDate: {},
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }
  componentDidShow() {
    this.inject.tabBarStore.setSelected(1);
    this.setMeBtnPosition();
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

  handleSelect(e) {
    const index = e.detail.value;
    const value = this.state.selectList[index]?.id;
    this.setState({
      stadiumId: value,
    });
  }

  handleSelectDate(index) {
    const target = DATA_LIST[index];
    console.log(target);
    this.setState({
      selectDate: target,
    });
  }

  jumpDetails(item) {
    console.log(item);
    Taro.navigateTo({
      url: '../match-details/index',
    });
  }

  render() {
    const { selectList, tabPosition, selectDate } = this.state;

    return (
      <View className="match-page">
        <View className="top-bar">
          <Picker
            mode="selector"
            rangeKey="label"
            range={selectList}
            onChange={(e) => this.handleSelect(e)}
          >
            <View className="bar" style={tabPosition}>
              <Text>力帆足球俱乐部</Text>
              <AtIcon value="chevron-down" size="20" color="#000"></AtIcon>
            </View>
          </Picker>
        </View>
        <View className="date-list">
          <View className="scroll-warp">
            {DATA_LIST.map((date, index) => {
              return (
                <View
                  className={
                    selectDate?.day === date.day ? 'item active' : 'item'
                  }
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

        <View className="list">
          <View className="scroll-warp">
            {[1, 2, 3, 4, 5, 6].map((item) => {
              return (
                <View className="item" onClick={() => this.jumpDetails(item)}>
                  <View className="top">
                    <View className="left">重复场次</View>
                    <View className="right">
                      <Text>已报名：2人</Text>
                      <View className="share">
                        <AtIcon
                          value="share"
                          size="14"
                          color="#0080FF"
                        ></AtIcon>
                        <Text>分享</Text>
                      </View>
                    </View>
                  </View>
                  <View className="item-body">
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                    <View>场地：撒娇的尽可能</View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default MatchPage;
