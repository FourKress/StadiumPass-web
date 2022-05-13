import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtIcon, AtSwitch } from 'taro-ui';
import requestData from '@/utils/requestData';
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
    label: '0%',
    value: 0,
  },
  {
    label: '10%',
    value: 0.1,
  },
  {
    label: '20%',
    value: 0.2,
  },
  {
    label: '30%',
    value: 0.3,
  },
  {
    label: '40%',
    value: 0.4,
  },
  {
    label: '50%',
    value: 0.5,
  },
  {
    label: '60%',
    value: 0.6,
  },
  {
    label: '70%',
    value: 0.7,
  },
  {
    label: '80%',
    value: 0.8,
  },
  {
    label: '90%',
    value: 0.9,
  },
  {
    label: '100%',
    value: 1,
  },
];

interface IState {
  refundStatus: boolean;
  refundRules: any[];
  stadiumId: string;
  refundInfo: any;
}

class RefundRulesPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      refundStatus: false,
      refundRules: [],
      stadiumId: '',
      refundInfo: null,
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.getRules(stadiumId);
    this.setState({
      stadiumId,
    });
  }

  getRules(stadiumId) {
    requestData({
      method: 'POST',
      api: '/refundRule/checkByStadium',
      params: {
        stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        refundInfo: res,
        refundRules: res?.rules || [],
        refundStatus: !!res,
      });
    });
  }

  async handleChangeRefundStatus(value) {
    this.setState({
      refundStatus: value,
    });
    if (!value) {
      await this.handleCloseRefundRules();
    } else {
      this.addRule(true);
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
      value = ratioTypes[selectIndex].value;
    } else if (key === 'refundTime') {
      value = timeList[selectIndex].value;
    }
    if (!(await this.checkRulesRepeat(value, key))) {
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

  async addRule(isInit = false) {
    const refundRules = this.state.refundRules;
    if (isInit) {
      const defaultRules: any = await this.getDefaultRules();
      if (defaultRules?.length) {
        refundRules.push(...defaultRules);
      }
    } else {
      refundRules.push({
        refundTime: '',
        refundRatio: '',
      });
    }
    this.setState({
      refundRules,
      refundStatus: true,
    });
  }

  async getDefaultRules() {
    let rules = [];
    await requestData({
      method: 'GET',
      api: `/refundRule/default`,
    }).then((res: any) => {
      rules = res || [];
    });
    return rules;
  }

  async checkRulesRepeat(value, type) {
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

  async checkRulesValid() {
    const { refundRules } = this.state;
    if (refundRules?.length) {
      const status = refundRules.some((d) => d.refundTime === '' || d.refundRatio === '');
      if (status) {
        await Taro.showToast({
          title: '请先完善规则！',
          icon: 'none',
        });
        return false;
      }
    }
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
    const { refundRules, refundInfo, refundStatus, stadiumId } = this.state;
    let url;
    let params;
    if (refundInfo?.id) {
      if (!refundStatus) {
        url = 'close';
        params = {
          id: refundInfo.id,
        };
      } else if (refundRules?.length) {
        url = 'modify';
        params = {
          id: refundInfo.id,
          rules: refundRules,
        };
      }
    } else {
      url = 'create';
      params = {
        rules: refundRules,
        stadiumId,
      };
    }

    requestData({
      method: 'POST',
      api: `/refundRule/${url}`,
      params,
    }).then(async () => {
      await this.handleBack();
    });
  }

  async handleBack() {
    const eventChannel = Taro.getCurrentPages()[Taro.getCurrentPages().length - 1].getOpenerEventChannel();
    eventChannel.emit('refundRulesStatus', this.state.refundStatus);
    await Taro.navigateBack({
      delta: -1,
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
        <View className="tips">
          <View>1、关闭时，所有组队报名均不支持退款。</View>
          <View>2、规则修改保存后，新规则将实时生效。</View>
          <View>3、距开场时间越大，退款比例也应该越大。</View>
        </View>
        <View className="list">
          {refundRules.map((item, index) => {
            return (
              <View className="item">
                <View>距开场小于</View>
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
                    {item.refundRatio !== '' ? (
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
