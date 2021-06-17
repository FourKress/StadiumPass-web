import React, { Component } from 'react';
import {Text, View} from '@tarojs/components';
// import Taro from '@tarojs/taro';
// import requestData from "@/utils/requestData";

import './index.scss';
import {AtIcon} from "taro-ui";

interface IState {
  cardList: Array<any>;
}

class MyWatchPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      cardList: [{}, {}, {}, {}, {}, {}],
    };
  }

  componentDidShow() {
  }

  render() {
    const { cardList } = this.state;
    console.log(cardList)

    return (
      <View className="card-page">
        <View className="list">
          {cardList.map(() => {
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
            )
          })}
        </View>
      </View>
    );
  }
}

export default MyWatchPage;
