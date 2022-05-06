import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtIcon, AtSwitch } from 'taro-ui';
// import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';

import './index.scss';

const timeList = Array.from(new Array(24).keys()).map((d) => {
  const value = d + 1;
  return {
    label: value,
    value,
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
      refundStatus: true,
      refundRules: [{}],
    };
  }

  componentDidShow() {}

  async handleChangeRefundStatus(value) {
    this.setState({
      refundStatus: value,
    });
    if (!value) {
      await this.handleCloseRefundRules();
    } else {
      this.addRule();
    }
  }

  async handleCloseRefundRules() {
    await Taro.showModal({
      title: '提示',
      content: '确定要关闭退款规则吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setState({
            refundStatus: false,
            refundRules: [],
          });
        } else {
          this.setState({
            refundStatus: true,
          });
        }
      },
    });
  }

  async handleSelectChange(event, key: string, index) {
    const selectIndex = event.detail.value;
    const refundRules = this.state.refundRules;
    let value;
    if (key === 'refundRatio') {
      value = ratioTypes[selectIndex].value;
    } else if (key === 'refundTime') {
      value = timeList[selectIndex].value;
    }
    if (!(await this.checkRulesValid(value, key))) {
      return;
    }
    refundRules[index][key] = value;
    this.setState({
      refundRules,
    });
  }

  async clearRule(index) {
    const refundRules = this.state.refundRules;
    if (refundRules?.length <= 1) {
      await this.handleCloseRefundRules();
      return;
    }
    refundRules.splice(index, 1);
    this.setState({
      refundRules,
    });
  }

  addRule() {
    const eventChannel = Taro.getCurrentPages()[Taro.getCurrentPages().length - 1].getOpenerEventChannel();
    eventChannel.emit('refundRulesStatus', { data: 'test' });

    const refundRules = this.state.refundRules;
    refundRules.push({
      refundTime: '',
      refundRatio: '',
    });
    this.setState({
      refundRules,
      refundStatus: true,
    });
  }

  async checkRulesValid(value, type) {
    const { refundRules } = this.state;
    const checkMap = {
      refundTime: () => refundRules.some((d) => d.refundTime === value),
      refundRatio: () => refundRules.some((d) => d.refundRatio === value),
    };
    const flag = checkMap[type]();
    if (flag) {
      await Taro.showToast({
        title: `${type === 'refundTime' ? '距开场时间' : '可退款比例'}不可重复`,
        icon: 'none',
      });
      return false;
    }
    return true;
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
                <Picker
                  mode="selector"
                  range={timeList}
                  rangeKey="label"
                  onChange={(event) => this.handleSelectChange(event, 'refundTime', index)}
                >
                  <View className="time">
                    {item.refundTime ? (
                      <View className="wrap">{timeList.find((d) => d.value === item.refundTime)?.label}</View>
                    ) : (
                      <View className="placeholder wrap">请选择</View>
                    )}
                    <AtIcon value="chevron-down" size="20" color="#101010"></AtIcon>
                  </View>
                </Picker>
                <View>小时，可退款</View>
                <Picker
                  mode="selector"
                  range={ratioTypes}
                  rangeKey="label"
                  onChange={(event) => this.handleSelectChange(event, 'refundRatio', index)}
                >
                  <View className="ratio">
                    {item.refundRatio ? (
                      <View className="wrap">{ratioTypes.find((d) => d.value === item.refundRatio)?.label}</View>
                    ) : (
                      <View className="placeholder wrap">请选择</View>
                    )}
                    <AtIcon value="chevron-down" size="20" color="#101010"></AtIcon>
                  </View>
                </Picker>
                <AtIcon
                  className="clear-btn"
                  value="close"
                  size="20"
                  color="#f00"
                  onClick={() => this.clearRule(index)}
                ></AtIcon>
              </View>
            );
          })}
          {refundRules?.length < 3 && refundRules?.length > 0 && (
            <View className="item">
              <View className="add-btn" onClick={() => this.addRule()}>
                <AtIcon value="add" size="14" color="#0092ff"></AtIcon>新增规则
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default RefundRulesPage;
