import React, { Component } from 'react';
import { View, Text, Picker, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

// @ts-ignore
// import * as echarts from '../../ec-canvas/echarts';

// const chart = null;

interface IState {
  tabPosition: object;
  statisticsDate: string;
  tabActive: number;
  summary: any;
  // ec: object;
  topList: Array<any>;
}

// const option = {
//   xAxis: {
//     type: 'category',
//     data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
//   },
//   yAxis: {
//     type: 'value',
//   },
//   series: [
//     {
//       data: [120, 200, 150, 80, 70, 110, 130],
//       type: 'bar',
//     },
//   ],
// };

// function initChart(canvas, width, height, dpr) {
//   chart = echarts.init(canvas, null, {
//     width: width,
//     height: height,
//     devicePixelRatio: dpr, // new
//   });
//   canvas.setChart(chart);
//   // @ts-ignore
//   chart.setOption(option);
//   return chart;
// }

class StatisticsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      tabPosition: {},
      summary: {},
      tabActive: 0,
      statisticsDate: dayjs().format('YYYY-MM'),
      // ec: {
      //   onInit: initChart,
      // },
      topList: [],
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.setMeBtnPosition();
    this.getMonthAndAayStatistics();
    this.getSignUpTop(stadiumId);
  }

  getMonthAndAayStatistics(month = '') {
    requestData({
      method: 'GET',
      api: '/order/monthAndAayStatistics',
      params: {
        month,
      },
    }).then((res) => {
      this.setState({
        summary: res,
      });
    });
  }

  getSignUpTop(stadiumId) {
    requestData({
      method: 'GET',
      api: '/order/signUpTop',
      params: {
        stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        topList: res,
      });
    });
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
        top: stateHeight + top,
        height,
      },
    });
  }

  handleTabsChange(index) {
    this.setState({
      tabActive: index,
    });
  }

  handleDateChange(e) {
    const { value } = e.detail;
    this.setState({
      statisticsDate: value,
    });
    this.getMonthAndAayStatistics(value);
  }

  goBack() {
    Taro.navigateBack({
      delta: -1,
    });
  }

  refChart = React.createRef();

  // renderChart() {
  //   return (
  //     // @ts-ignore
  //     <ec-canvas
  //       ref={this.refChart}
  //       canvas-id="chart-area"
  //       ec={this.state.ec}
  //       force-use-old-canvas="true"
  //     />
  //   );
  // }

  render() {
    const { tabPosition, statisticsDate, tabActive, topList, summary } = this.state;
    const tabs = ['收入统计', '支出统计'];

    return (
      <View className="statistics-page">
        <View className="page-banner">
          <View className="page-header" style={tabPosition}>
            <AtIcon
              onClick={() => this.goBack()}
              className="back-icon"
              value="chevron-left"
              size="24"
              color="#fff"
            ></AtIcon>
            <View className="tab">
              {tabs.map((d, index) => {
                return (
                  <Text
                    className={index === tabActive ? 'item active' : 'item'}
                    onClick={() => this.handleTabsChange(index)}
                  >
                    {d}
                  </Text>
                );
              })}
            </View>
          </View>
          <View className="info">
            <View className="date">
              <Picker value={statisticsDate} mode="date" fields="month" onChange={(e) => this.handleDateChange(e)}>
                <View className="time">
                  <Text className="text">{statisticsDate.substring(0, 4)}</Text>年
                  <Text className="text">{statisticsDate.substring(5, 7)}</Text>月
                </View>
                <AtIcon value="chevron-down" size="24" color="#fff"></AtIcon>
              </Picker>
            </View>
            <View className="money">{summary.monthCount}</View>
          </View>
        </View>
        <View className="main">
          <View className="title">收入对比</View>
          {/*<View className="charts">{this.renderChart()}</View>*/}
          <View className="title">报名Top10</View>
          {topList.length > 0 ? (
            <View className="list">
              {topList.map((item, index) => {
                return (
                  <View className="item">
                    <View className="index">{index + 1}</View>
                    <View className="user">
                      <Image src={item?.user?.avatarUrl}></Image>
                      <Text className="name">{item?.user?.nickName}</Text>
                    </View>
                    <View className="info">
                      <View className="money">{item.totalPayAmount}</View>
                      <View className="count">{item.count}次</View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="not-data" style="margin-top: 16px">
              暂无数据
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default StatisticsPage;
