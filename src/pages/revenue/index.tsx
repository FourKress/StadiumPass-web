import React, { Component } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon, AtDrawer, AtInput } from 'taro-ui';
// import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

interface IState {
  showDrawer: boolean;
  selectList: Array<any>;
  stadiumId: string;
  stadiumDate: string;
}

const dateNow = dayjs().format('YYYY-MM-DD');

class RevenuePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      showDrawer: false,
      selectList: [
        {
          label: '测试1',
          id: '123',
        },
      ],
      stadiumId: '',
      stadiumDate: dateNow,
    };
  }
  componentDidShow() {}

  showTotal() {
    console.log(1);
    Taro.navigateTo({
      url: '../statistics/index',
    });
  }
  handleShowDrawer() {
    this.setState({
      showDrawer: true,
    });
  }

  handleCloseDrawer() {
    this.setState({
      showDrawer: false,
    });
  }
  handleDateChange(e) {
    const { value } = e.detail;
    this.setState({
      stadiumDate: value,
    });
  }
  handleSelect(e) {
    const index = e.detail.value;
    const value = this.state.selectList[index]?.id;
    this.setState({
      stadiumId: value,
    });
  }

  reset() {
    this.setState({
      stadiumDate: dateNow,
      stadiumId: '',
    });
  }

  searchSubmit() {
    this.handleCloseDrawer();
  }

  render() {
    const { showDrawer, selectList, stadiumId, stadiumDate } = this.state;

    return (
      <View className="indexPage">
        <View className="top-info">
          <View className="top">
            <View className="left">
              <View className="title">今日总收入</View>
              <View className="total">13212.00</View>
            </View>
            <View className="right" onClick={() => this.showTotal()}>
              <Text>统计</Text>
              <AtIcon value="chevron-right" size="20" color="#fff"></AtIcon>
            </View>
          </View>
          <View className="banner">
            <View className="item">
              <View className="title">本月总收入</View>
              <View className="text">4324.00</View>
            </View>
            <View className="item">
              <View className="title">钱包余额</View>
              <View className="text">4324.00</View>
            </View>
          </View>
        </View>

        <View className="panel">
          <View className="row">
            <Text className="name">营收</Text>
            <View className="btn" onClick={() => this.handleShowDrawer()}>
              <View className="search-icon"></View>
              <Text>自定义查询</Text>
            </View>
          </View>

          <View className="list-panel">
            {[1, 2, 3].map(() => {
              return (
                <View className="info">
                  <View className="title">
                    <Text>2021-11-11</Text>
                    <Text>圣诞节时空裂缝</Text>
                  </View>
                  <View className="list">
                    <View className="item">
                      <View className="left">
                        <Text>18:00 — 20:00</Text>
                        <Text className="index">2号场</Text>
                      </View>
                      <View className="right">
                        <View className="price">
                          <View className="success">
                            <Text className="sign">-&nbsp;￥</Text>
                            <Text className="money">25.00</Text>
                          </View>
                          <View className="tips">32123啥的</View>
                        </View>
                        <AtIcon
                          value="chevron-right"
                          size="20"
                          color="#93A7B6"
                        ></AtIcon>
                      </View>
                    </View>
                    <View className="item">
                      <View className="left">
                        <Text>18:00 — 20:00</Text>
                        <Text className="index">2号场</Text>
                      </View>
                      <View className="right">
                        <View className="price">
                          <View className="fail">组队失败</View>
                          <View className="tips">32123啥的</View>
                        </View>
                        <AtIcon
                          value="chevron-right"
                          size="20"
                          color="#93A7B6"
                        ></AtIcon>
                      </View>
                    </View>
                  </View>
                  <View className="service-fee">
                    <View className="left">技术服务费</View>
                    <View className="right">
                      <View>
                        <Text className="sign">-&nbsp;￥</Text>
                        <Text className="money">25.00</Text>
                      </View>
                      <View className="percentage">-5%</View>
                    </View>
                  </View>
                  <View className="footer">
                    <Text>今日总收入：</Text>
                    <View className="total">
                      <View className="sign">+&nbsp;￥</View>
                      <View className="money">3123.00</View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <AtDrawer
          show={showDrawer}
          onClose={() => this.handleCloseDrawer()}
          mask
          width="260px"
          right
        >
          <View className="drawer-panel">
            <View className="drawer-top">
              <Text>自定义查询</Text>
              <AtIcon
                onClick={() => this.handleCloseDrawer()}
                value="close"
                size="16"
              />
            </View>
            <View className="form-panel">
              <View className="drawer-item">
                <Picker
                  mode="selector"
                  rangeKey="label"
                  range={selectList}
                  onChange={(e) => this.handleSelect(e)}
                >
                  <View className="title">请选择球场</View>
                  <AtInput
                    name="stadiumId"
                    onChange={() => {}}
                    value={selectList.find((d) => d.id === stadiumId)?.label}
                    editable={false}
                  ></AtInput>
                </Picker>
              </View>
              <View className="drawer-item">
                <Picker
                  value={stadiumDate}
                  mode="date"
                  onChange={(e) => this.handleDateChange(e)}
                >
                  <View className="title">请选择时间</View>
                  <AtInput
                    name="stadiumDate"
                    onChange={() => {}}
                    value={stadiumDate}
                    editable={false}
                  ></AtInput>
                </Picker>
              </View>
            </View>
            <View className="drawer-footer">
              <Text onClick={() => this.reset()}>重置</Text>
              <View className="submit-btn" onClick={() => this.searchSubmit()}>
                确定
              </View>
            </View>
          </View>
        </AtDrawer>
      </View>
    );
  }
}

export default RevenuePage;
