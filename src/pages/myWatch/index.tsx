import React, { Component } from 'react';
import { Text, View } from '@tarojs/components';
// import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

import './index.scss';
import { AtIcon } from 'taro-ui';

interface IState {
  watchList: Array<any>;
}

class MyWatchPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      watchList: [],
    };
  }

  componentDidShow() {
    this.getWatchList();
  }

  getWatchList() {
    requestData({
      method: 'GET',
      api: '/userRelationStadium/watchList',
    }).then((data: any) => {
      this.setState({
        watchList: data,
      });
      console.log(data);
    });
  }

  render() {
    const { watchList } = this.state;

    return (
      <View className="card-page">
        <View className="list">
          {watchList.length ? (
            watchList.map(() => {
              return (
                <View className="item">
                  <Text className="label">啊实打实大师</Text>
                  <View className="info">
                    <AtIcon
                      value="chevron-right"
                      size="24"
                      color="#333D44"
                    ></AtIcon>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="not-data">暂无数据</View>
          )}
        </View>
      </View>
    );
  }
}

export default MyWatchPage;
