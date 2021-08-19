import React, { Component } from 'react';
import { View, Text, Picker, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';

// import requestData from '@/utils/requestData';

import dayjs from 'dayjs';

import './index.scss';

// @ts-ignore
// import * as echarts from '../../ec-canvas/echarts';

// const chart = null;

interface IState {
  tabPosition: object;
  statisticsDate: string;
  tabActive: number;
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
      tabActive: 0,
      statisticsDate: dayjs().format('YYYY-MM'),
      // ec: {
      //   onInit: initChart,
      // },
      topList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 12],
    };
  }

  componentDidShow() {
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
    const { tabPosition, statisticsDate, tabActive, topList } = this.state;
    const tabs = ['收入统计', '支出统计'];

    return (
      <View className="statistics-page">
        <View className="page-banner">
          <View className="page-header" style={tabPosition}>
            <AtIcon
              onClick={() => this.goBack()}
              className="back-icon"
              value="chevron-left"
              size="20"
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
              <Picker
                value={statisticsDate}
                mode="date"
                fields="month"
                onChange={(e) => this.handleDateChange(e)}
              >
                <View className="time">
                  <Text className="text">{statisticsDate.substring(0, 4)}</Text>
                  年
                  <Text className="text">{statisticsDate.substring(5, 7)}</Text>
                  月
                </View>
                <AtIcon value="chevron-down" size="24" color="#fff"></AtIcon>
              </Picker>
            </View>
            <View className="money">4444.00</View>
          </View>
        </View>
        <View className="main">
          <View className="title">收入对比</View>
          {/*<View className="charts">{this.renderChart()}</View>*/}
          <View className="title">报名Top10</View>
          <View className="list">
            {topList.map((item, index) => {
              console.log(item);
              return (
                <View className="item">
                  <View className="index">{index + 1}</View>
                  <View className="user">
                    <Image src=""></Image>
                    <Text className="name">大手大脚凯撒奖待对对对</Text>
                  </View>
                  <View className="info">
                    <View className="money">444.00</View>
                    <View className="count">40次</View>
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

export default StatisticsPage;
