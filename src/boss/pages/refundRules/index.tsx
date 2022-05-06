import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtSwitch } from 'taro-ui';
// import requestData from '@/utils/requestData';
// import Taro from '@tarojs/taro';

import './index.scss';

const timeList = Array.from(new Array(24).keys()).map((d) => {
  return {
    label: d + 1,
    value: d + 1,
  };
});

const ratioTypes = [
  {
    label: '100%',
    value: 1,
  },
  {
    label: '90%',
    value: 0.9,
  },
  {
    label: '80%',
    value: 0.8,
  },
  {
    label: '70%',
    value: 0.7,
  },
  {
    label: '60%',
    value: 0.6,
  },
  {
    label: '50%',
    value: 0.5,
  },
  {
    label: '40%',
    value: 0.4,
  },
  {
    label: '30%',
    value: 0.3,
  },
  {
    label: '20%',
    value: 0.2,
  },
  {
    label: '10%',
    value: 0.1,
  },
];

interface IState {
  refundStatus: boolean;
  refundRules: any[];
}

class RefundRulesPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      refundStatus: false,
      refundRules: [{}],
    };
  }

  componentDidShow() {}

  handleChangeRefundStatus(value) {
    this.setState({
      refundStatus: value,
    });
  }

  handleSelectChange(event, key: string, index) {
    const selectIndex = event.detail.value;
    const refundRules = this.state.refundRules;
    let value;
    if (key === 'refundRatio') {
      value = ratioTypes[selectIndex].value;
    } else if (key === 'refundTime') {
      value = timeList[selectIndex].value;
    }
    refundRules[index][key] = value;
    this.setState({
      refundRules,
    });
  }

  render() {
    const { refundStatus, refundRules } = this.state;

    return (
      <View className="refund-rules-page">
        <AtSwitch
          title="是否支持退款"
          color="#00E36A"
          checked={refundStatus}
          onChange={(value) => this.handleChangeRefundStatus(value)}
        />
        <View className="tips">关闭时，所有组队报名均不支持退款。</View>
        <View className="list">
          {refundRules.map((item, index) => {
            return (
              <View className="item">
                <View>距开场</View>
                <View className="time">
                  <Picker
                    mode="selector"
                    range={timeList}
                    rangeKey="label"
                    onChange={(event) => this.handleSelectChange(event, 'refundTime', index)}
                  >
                    {item.refundTime ? (
                      <View>{timeList.find((d) => d.value === item.refundTime)?.label}</View>
                    ) : (
                      <View>请选择</View>
                    )}
                  </Picker>
                </View>
                <View>小时</View>
                <View>，可退款</View>
                <View className="ratio">
                  <Picker
                    mode="selector"
                    range={ratioTypes}
                    rangeKey="label"
                    onChange={(event) => this.handleSelectChange(event, 'refundRatio', index)}
                  >
                    {item.refundRatio ? (
                      <View>{ratioTypes.find((d) => d.value === item.refundRatio)?.label}</View>
                    ) : (
                      <View>请选择</View>
                    )}
                  </Picker>
                </View>
                <View className="icon"></View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}

export default RefundRulesPage;
