import React, { Component } from 'react';
import { Text, View } from '@tarojs/components';
import requestData from '@/utils/requestData';

import './index.scss';
import Taro from '@tarojs/taro';

interface IState {
  matchList: Array<any>;
  stadiumId: string;
}

class FailStadiumPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      stadiumId: '',
      matchList: [],
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.setState(
      {
        stadiumId,
      },
      () => {
        this.getMatchList();
      }
    );
  }

  getMatchList() {
    requestData({
      method: 'GET',
      api: '/match/failList',
      params: {
        stadiumId: this.state.stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        matchList: res,
      });
    });
  }

  render() {
    const { matchList } = this.state;

    return (
      <View className="fail-stadium-page">
        {matchList.length > 0 ? (
          <View className="list">
            <View className="scroll-warp">
              {matchList.map((item) => {
                return (
                  <View className="item">
                    <View className="top">
                      <View className="left">{item.repeatModel === 1 ? '单次场次' : '重复场次'}</View>
                      <View className="right">
                        <View className="money">
                          <Text>￥{item.rebatePrice}</Text>
                          <Text className="discount">{item.rebate}折</Text>
                          <Text>/人</Text>
                        </View>
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
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="not-data" style="margin-top: 16px">
            暂无数据
          </View>
        )}
      </View>
    );
  }
}

export default FailStadiumPage;
