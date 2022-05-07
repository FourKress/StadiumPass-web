import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtIcon, AtSwitch } from 'taro-ui';
// import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';

import './index.scss';

const timeListSources = Array.from(new Array(24).keys()).map((d) => {
  const value = d + 1;
  return {
    label: value,
    value,
  };
});

const ratioTypesSources = [
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
  timeList: any[];
  ratioTypes: any[];
}

class RefundRulesPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      refundStatus: false,
      timeList: [],
      ratioTypes: [],
      refundRules: [],
    };
  }

  componentDidShow() {
    // const refundRules = [
    //   { refundRatio: 0.9, refundTime: 3 },
    //   { refundRatio: 0.8, refundTime: 2 },
    //   { refundRatio: 0.7, refundTime: 1 },
    // ];
    const refundRules = [];
    this.changeSelectList(refundRules);
    this.setState({
      refundRules,
      refundStatus: true,
    });
  }

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
    const { refundRules } = this.state;
    let value;
    if (key === 'refundRatio') {
      value = ratioTypesSources[selectIndex].value;
    } else if (key === 'refundTime') {
      value = timeListSources[selectIndex].value;
    }
    refundRules[index][key] = value;
    this.changeSelectList(refundRules);
    this.setState({
      refundRules,
    });
  }

  changeSelectList(refundRules) {
    const times: number[] = [];
    const ratios: number[] = [];
    refundRules.forEach((d) => {
      times.push(d.refundTime);
      ratios.push(d.refundRatio);
    });
    this.setState({
      refundRules,
      timeList: timeListSources.filter((d) => !times.includes(d.value)),
      ratioTypes: ratioTypesSources.filter((d) => !ratios.includes(d.value)),
    });
  }

  async clearRule(index) {
    const refundRules = this.state.refundRules;
    if (refundRules?.length <= 1) {
      await this.handleCloseRefundRules();
      return;
    }
    refundRules.splice(index, 1);
    this.changeSelectList(refundRules);
    this.setState({
      refundRules,
    });
  }

  addRule() {
    const refundRules = this.state.refundRules;
    refundRules.push({
      refundTime: '',
      refundRatio: '',
    });
    this.changeSelectList(refundRules);
    this.setState({
      refundRules,
      refundStatus: true,
    });
  }

  async checkRulesValid() {
    const { refundRules } = this.state;
    if (refundRules?.length === 1) return true;
    const rules = refundRules.sort((a, b) => a.refundTime - b.refundTime);
    let flag = true;
    for (let i = 1; i < rules.length; i++) {
      if (rules[i].refundRatio < rules[i - 1].refundRatio) {
        flag = false;
      }
    }
    if (!flag) {
      await Taro.showToast({
        title: '规则错误，距开场时间越大，退款比例也应该越大！',
        icon: 'none',
      });
      return false;
    }
    return true;
  }

  async handleSave() {
    if (!(await this.checkRulesValid())) {
      return;
    }

    const eventChannel = Taro.getCurrentPages()[Taro.getCurrentPages().length - 1].getOpenerEventChannel();
    eventChannel.emit('refundRulesStatus', this.state.refundStatus);
    await Taro.navigateBack({
      delta: -1,
    });
  }

  render() {
    const { refundStatus, refundRules, timeList, ratioTypes } = this.state;

    return (
      <View className="refund-rules-page">
        <AtSwitch
          title="是否支持退款"
          color="#00E36A"
          checked={refundStatus}
          onChange={(value) => this.handleChangeRefundStatus(value)}
        />
        <View className="tips">
          <View>1、关闭时，所有组队报名均不支持退款。</View>
          <View>2、规则修改保存后，新规则将实时生效。</View>
          <View>3、距开场时间越大，退款比例也应该越大。</View>
        </View>
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
                      <View className="wrap">{timeListSources.find((d) => d.value === item.refundTime)?.label}</View>
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
                      <View className="wrap">{ratioTypesSources.find((d) => d.value === item.refundRatio)?.label}</View>
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

        <View className="btn-list">
          <View className="btn" onClick={() => this.handleSave()}>
            保存
          </View>
        </View>
      </View>
    );
  }
}

export default RefundRulesPage;