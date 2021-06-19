import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { AtTabs, AtIcon, AtTabsPane } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';

interface IState {
  orderList: Array<any>;
  tabValue: number;
  open: boolean;
  meBtbPosition: object;
}

const tabList = [{ title: '场次报名' }, { title: '场馆介绍' }];

class StadiumPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      tabValue: 0,
      open: false,
      meBtbPosition: {},
    };
  }

  componentDidShow() {
    this.setMeBtnPosition();
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

  handleTabClick(val) {
    this.setState({
      tabValue: val,
    });
  }

  handlePeoPleOpen() {
    const { open } = this.state;
    this.setState({
      open: !open,
    });
  }

  render() {
    const { tabValue, open, meBtbPosition } = this.state;

    return (
      <View className="stadium-page">
        <View className="page-header">
          <Image className="bg" src=""></Image>
          <View className="me" style={meBtbPosition}>
            <Image className="icon" src=""></Image>
            <Text>我的</Text>
          </View>
        </View>
        <View className="main">
          <View className="top">
            <View className="left">
              <View className="name">胜多负少李逵负荆</View>
              <View className="address">
                <View className="icon"></View>
                <Text>年开始打索拉卡建档立卡</Text>
              </View>
            </View>
            <View className="watch"></View>
          </View>

          <AtTabs
            current={tabValue}
            tabList={tabList}
            onClick={(value) => this.handleTabClick(value)}
          >
            <AtTabsPane current={tabValue} index={0}>
              <View className="space-panel">
                <View className="list">
                  <View className="item">
                    <View className="type">一号厂</View>
                    <View className="unit">5V5</View>
                    <View className="tips1">折</View>
                  </View>
                  <View className="item">
                    <View className="type">一号厂</View>
                    <View className="unit">5V5</View>
                    <View className="tips2">满</View>
                  </View>
                  <View className="item">
                    <View className="type">一号厂</View>
                    <View className="unit">5V5</View>
                    <View className="tips1">折</View>
                  </View>
                  <View className="item">
                    <View className="type">一号厂</View>
                    <View className="unit">5V5</View>
                    <View className="tips1">折</View>
                  </View>
                </View>
                <View className="date">
                  <View className="info">
                    <View className="day">今天</View>
                    <View>06.09</View>
                  </View>
                  <AtIcon
                    value="chevron-down"
                    size="24"
                    color="#101010"
                  ></AtIcon>
                </View>
              </View>

              <View className="people-panel">
                <View className="panel">
                  <View className="p-top">
                    <View className="info">
                      <Text>
                        18:00 - 20:00 / 2小时 / 2
                        <Text style="font-weight: bold;">/</Text>15
                      </Text>
                      <View className="tips1">折</View>
                    </View>
                    <AtIcon
                      className={open ? '' : 'open'}
                      onClick={() => this.handlePeoPleOpen()}
                      value="chevron-down"
                      size="24"
                      color="#101010"
                    ></AtIcon>
                  </View>
                  <View className={open ? 'list' : 'list hidden'}>
                    <View className="item">
                      <View className="img">
                        {/*<Image src=""></Image>*/}
                        <View className="index">1</View>
                      </View>
                      {/*<View className="name">白龙马不是马白龙马不是马</View>*/}
                      {/*<View className="name default">虚位以待</View>*/}
                      <View className="icon">
                        <AtIcon
                          value="check"
                          size="24"
                          color="#0092FF"
                        ></AtIcon>
                      </View>
                    </View>
                    <View className="item">
                      <View className="img">
                        <Image src=""></Image>
                      </View>
                      <View className="name">白龙马不是马白龙马不是马</View>
                    </View>
                    <View className="item">
                      <View className="img">
                        <Image src=""></Image>
                      </View>
                      <View className="name">白龙马不是马白龙马不是马</View>
                    </View>
                    <View className="item">
                      <View className="img">
                        <Image src=""></Image>
                      </View>
                      <View className="name">白龙马不是马白龙马不是马</View>
                    </View>
                  </View>
                </View>
              </View>
            </AtTabsPane>
            <AtTabsPane current={tabValue} index={1}>
              <View className="details">
                <View className="row" style="border-bottom: 1px solid #F2F2F2">
                  <View className="icon"></View>
                  <View className="label">电话</View>
                  <View className="info">
                    <Text style="color: #0092FF">17384094579</Text>
                  </View>
                </View>
                <View className="row">
                  <View className="icon"></View>
                  <View className="label">位置</View>
                  <View className="info">
                    <Text>重庆市江北区洋河北路6号</Text>
                  </View>
                </View>
                <View className="row flex-start" style="margin-top: 16px">
                  <View className="icon"></View>
                  <View className="label">场地</View>
                  <View className="info">
                    <View className="text">
                      足球 - 5v5 x3；8v8 x2；11v11 x1。
                    </View>
                    <View className="text">篮球 - 5v5x1。</View>
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
            <View className="info">
              <View className="text">已选数量：2，共：</View>
              <View className="money">
                <View className="new">50</View>
                <View className="old">
                  <Text className="price">100</Text>
                  <View className="tips1">5折</View>
                </View>
              </View>
            </View>
            <View className="btn">立即报名</View>
          </View>
        )}
      </View>
    );
  }
}

export default StadiumPage;
