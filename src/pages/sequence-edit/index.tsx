import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtForm, AtInput, AtList, AtListItem } from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

import './index.scss';
import dayjs from 'dayjs';

interface IForm {
  sequence?: number;
  model?: number;
  runDate: string;
  runEndTime: string;
  runStartTime: string;
  duration: string;
  minPeople: string | '';
  maxPeople: string | '';
  price: string;
  rebatePrice: string;
}

interface IState {
  form: IForm;
  modelList: Array<any>;
  sequenceList: Array<any>;
}

const dateNow = dayjs().format('YYYY-MM-DD');

class SequenceEditPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        price: '',
        rebatePrice: '',
        maxPeople: '',
        minPeople: '',
        runDate: dateNow,
        runEndTime: '',
        runStartTime: '',
        duration: '2',
      },
      modelList: [
        {
          label: 'test2',
          id: 2,
        },
      ],
      sequenceList: [
        {
          label: 'test',
          id: 1,
        },
      ],
    };
  }

  handleChange(value, key) {
    const form = this.state.form;
    form[key] = value;
    console.log(form, value, key);
    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleSelectChange(event, key: string) {
    const index = event.detail.value;
    const form = this.state.form;
    const value = this.state[`${key}List`][index].id;
    form[key] = value;
    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleDateChange(e, key) {
    const { value } = e.detail;
    const form = this.state.form;
    form[key] = value;
    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleSave() {
    const {
      form: { price, rebatePrice },
    } = this.state;
    if (rebatePrice > price) {
      Taro.showToast({
        title: '折扣价必须小于等于原价（相等则视为无折扣）。',
        icon: 'none',
      });
      return;
    }
    console.log(this.state);
  }

  render() {
    const { sequenceList, modelList, form } = this.state;

    return (
      <View className="sequence-edit-page">
        <View className="scroll-wrap">
          <AtForm className="form">
            <Picker
              mode="selector"
              range={sequenceList}
              rangeKey="label"
              onChange={(event) => this.handleSelectChange(event, 'sequence')}
            >
              <AtList>
                <AtListItem
                  title="场地"
                  arrow="down"
                  extraText={
                    sequenceList.find((d) => d.id === form.sequence)?.label
                  }
                />
              </AtList>
            </Picker>
            <View className="title">
              <View className="name">时间设置</View>
              <View className="tips">1、不重复：临时场次，只生效1次。</View>
              <View className="tips">
                2、每周重复：按周重复。例如可设置每周六、日重复的周末场。
              </View>
              <View className="tips">
                3、每天重复：按天重复。例如可设置为每天重复的固定场。
              </View>
            </View>
            <Picker
              mode="selector"
              range={modelList}
              rangeKey="label"
              onChange={(event) => this.handleSelectChange(event, 'model')}
            >
              <AtList>
                <AtListItem
                  title="重复模式"
                  arrow="down"
                  extraText={modelList.find((d) => d.id === form.model)?.label}
                />
              </AtList>
            </Picker>

            <Picker
              value={form.runDate}
              mode="date"
              onChange={(e) => this.handleDateChange(e, 'runDate')}
            >
              <AtList>
                <AtListItem
                  title="选择日期"
                  arrow="down"
                  extraText={form.runDate}
                />
              </AtList>
            </Picker>

            <Picker
              value={form.runStartTime}
              mode="time"
              onChange={(e) => this.handleDateChange(e, 'runStartTime')}
            >
              <AtList>
                <AtListItem
                  title="选择开始时间"
                  arrow="down"
                  extraText={form.runStartTime}
                />
              </AtList>
            </Picker>
            <Picker
              value={form.runEndTime}
              mode="time"
              onChange={(e) => this.handleDateChange(e, 'runEndTime')}
            >
              <AtList>
                <AtListItem
                  title="选择结束时间"
                  arrow="down"
                  extraText={form.runEndTime}
                />
              </AtList>
            </Picker>
            <AtInput
              name="duration"
              title="时长"
              type="text"
              editable={false}
              value={form.duration}
              onChange={() => {}}
            />

            <View className="title">
              <View className="name">人数设置</View>
            </View>
            <AtInput
              name="minPeople"
              title="最少开场人数"
              type="text"
              placeholder="请输入最少开场人数"
              value={form.minPeople}
              onChange={(value) => this.handleChange(value, 'minPeople')}
            />
            <AtInput
              name="maxPeople"
              title="满场人数"
              type="text"
              placeholder="请输入满场人数"
              value={form.maxPeople}
              onChange={(value) => this.handleChange(value, 'maxPeople')}
            />
            <View className="title">
              <View className="name">价格设置</View>
              <View className="tips">
                1、设置原价和折扣价后，系统将自动计算折扣。
              </View>
              <View className="tips">
                2、折扣价必须小于等于原价（相等则视为无折扣）。
              </View>
            </View>
            <AtInput
              name="price"
              title="单人原价"
              type="text"
              placeholder="请输入单人原价"
              value={form.price}
              onChange={(value) => this.handleChange(value, 'price')}
            />
            <AtInput
              name="rebatePrice"
              title="单人折扣价"
              type="text"
              placeholder="请输入单人折扣价"
              value={form.rebatePrice}
              onChange={(value) => this.handleChange(value, 'rebatePrice')}
            />
          </AtForm>
        </View>
        <View className="btn-list">
          <View className="btn" onClick={() => this.handleSave()}>
            保存场次
          </View>
        </View>
      </View>
    );
  }
}

export default SequenceEditPage;
