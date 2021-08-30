import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtForm, AtInput, AtList, AtListItem, AtCheckbox } from 'taro-ui';
import Taro from '@tarojs/taro';
import './index.scss';
import requestData from '@/utils/requestData';
import dayjs from 'dayjs';

interface IForm {
  stadiumId: string;
  spaceId: string;
  repeatModel: string;
  runDate: string;
  endAt: string;
  startAt: string;
  duration: string;
  minPeople: string | '';
  totalPeople: string | '';
  price: string;
  rebatePrice: string;
  repeatWeek: any;
  rebate?: number;
  id?: string;
}

interface IState {
  stadiumId: string;
  matchId: string;
  form: IForm;
  spaceList: Array<any>;
  weekList: Array<any>;
  repeatModelList: Array<any>;
}

const dateNow = dayjs().format('YYYY-MM-DD');

class MatchEditPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      stadiumId: '',
      matchId: '',
      form: {
        stadiumId: '',
        spaceId: '',
        totalPeople: '',
        minPeople: '',
        runDate: '',
        endAt: '',
        startAt: '',
        duration: '',
        repeatModel: '',
        repeatWeek: '',
        rebatePrice: '',
        price: '',
      },
      spaceList: [],
      weekList: [],
      repeatModelList: [],
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.stadiumId + '').toString();
    const matchId = pageParams?.matchId ? (pageParams.matchId + '').toString() : '';
    this.setState(
      {
        stadiumId,
        matchId,
        form: {
          ...this.state.form,
          stadiumId,
        },
      },
      async () => {
        this.getSpaceList();
        if (matchId) {
          this.getMatchDetails();
        }
      }
    );
    this.getWeekList();
    this.getRepeatModelList();
  }

  getMatchDetails() {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id: this.state.matchId,
      },
    }).then((res: any) => {
      const { repeatWeek } = res;
      const { form } = this.state;
      const tempForm = {};
      Object.keys(form).map((k) => {
        tempForm[k] = res[k];
      });

      this.setState({
        form: {
          ...form,
          ...tempForm,
          repeatWeek: repeatWeek.split(',').map((d) => Number(d)),
          rebate: res.rebate,
          id: res.id,
        },
      });
    });
  }

  getSpaceList() {
    requestData({
      method: 'GET',
      api: '/space/dropDownList',
      params: {
        stadiumId: this.state.stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        spaceList: res,
      });
    });
  }

  getWeekList() {
    requestData({
      method: 'GET',
      api: '/match/weekEnum',
    }).then((res: any) => {
      this.setState({
        weekList: res,
      });
    });
  }

  getRepeatModelList() {
    requestData({
      method: 'GET',
      api: '/match/repeatModelEnum',
    }).then((res: any) => {
      this.setState({
        repeatModelList: res,
      });
    });
  }

  handleChange(value, key) {
    const form = this.state.form;
    form[key] = value;
    if (form.rebatePrice && form.price) {
      if (!this.checkPrice(form.rebatePrice, form.price)) {
        form[key] = '';
      } else {
        form.rebate = parseFloat(((Number(form.rebatePrice) / Number(form.price)) * 10).toFixed(2));
      }
    }

    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleSelectChange(event, key: string) {
    const index = event.detail.value;
    const form = this.state.form;
    let value;
    if (key === 'spaceId') {
      value = this.state.spaceList[index].id;
    } else {
      value = this.state[`${key}List`][index].value;
      if (key === 'repeatModel') {
        form.runDate = value === 1 ? '' : dateNow;
      }
    }
    form[key] = value;
    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleCheckboxChange(value) {
    const form = this.state.form;
    form.repeatWeek = value;
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
    if (form.startAt && form.endAt) {
      const diff = this.checkDuration(form.startAt, form.endAt);
      if (!diff) {
        form[key] = '';
      } else {
        form.duration = parseFloat((diff / (1000 * 60 * 60)).toFixed(2)).toString();
      }
    }
    this.setState({
      form: {
        ...form,
      },
    });
  }

  checkDuration(startAt, endAt) {
    const diff = dayjs(`${dateNow} ${endAt}`)
      .startOf('minute')
      .diff(dayjs(`${dateNow} ${startAt}`));
    if (diff <= 0) {
      Taro.showToast({
        icon: 'none',
        title: '结束时间必须大于开始时间！',
      });
      return false;
    }
    return diff;
  }

  checkPrice(rebatePrice, price) {
    if (Number(rebatePrice) > Number(price)) {
      Taro.showToast({
        title: '折扣价必须小于等于原价（相等则视为无折扣）。',
        icon: 'none',
      });
      return false;
    }
    return true;
  }

  checkPeople(totalPrice, minPeople) {
    if (Number(totalPrice) < Number(minPeople)) {
      Taro.showToast({
        title: '满场人数必须大于等于最小开场人数',
        icon: 'none',
      });
      return false;
    }
    return true;
  }

  handleSave() {
    const { form, matchId } = this.state;
    const {
      repeatModel,
      rebate,
      totalPeople,
      minPeople,
      price,
      rebatePrice,
      duration,
      startAt,
      endAt,
      repeatWeek,
    } = form;
    const key = Object.keys(form).find((d) => !form[d] && d !== 'repeatWeek');
    if ((repeatModel === '2' && !repeatWeek) || key) {
      Taro.showToast({
        title: `请填写完整的场次信息, ${key} 不能为空`,
        icon: 'none',
      });
      return;
    }
    if (!this.checkDuration(startAt, endAt)) {
      return;
    }
    if (!this.checkPeople(totalPeople, minPeople)) {
      return;
    }
    if (!this.checkPrice(rebatePrice, price)) {
      return;
    }

    const params = {
      ...form,
      repeatModel: Number(repeatModel),
      repeatWeek: repeatWeek || undefined,
      rebate: Number(rebate),
      totalPeople: Number(totalPeople),
      minPeople: Number(minPeople),
      price: Number(price),
      rebatePrice: Number(rebatePrice),
      duration: Number(duration),
    };

    requestData({
      method: 'POST',
      api: matchId ? '/match/modify' : '/match/add',
      params,
    }).then(() => {
      Taro.showToast({
        icon: 'none',
        title: '场次保存成功',
      });
      Taro.navigateBack({
        delta: -1,
      });
    });
  }

  render() {
    const { spaceList, repeatModelList, form, weekList } = this.state;
    return (
      <View className="match-edit-page">
        <View className="scroll-wrap">
          <AtForm className="form">
            <Picker
              mode="selector"
              range={spaceList}
              rangeKey="name"
              onChange={(event) => this.handleSelectChange(event, 'spaceId')}
            >
              <AtList>
                <AtListItem title="场地" arrow="down" extraText={spaceList.find((d) => d.id === form.spaceId)?.name} />
              </AtList>
            </Picker>
            <View className="title">
              <View className="name">时间设置</View>
              <View className="tips">1、不重复：临时场次，只生效1次。</View>
              <View className="tips">2、每周重复：按周重复。例如可设置每周六、日重复的周末场。</View>
              <View className="tips">3、每天重复：按天重复。例如可设置为每天重复的固定场。</View>
            </View>
            <Picker
              mode="selector"
              range={repeatModelList}
              rangeKey="label"
              onChange={(event) => this.handleSelectChange(event, 'repeatModel')}
            >
              <AtList>
                <AtListItem
                  title="重复模式"
                  arrow="down"
                  extraText={repeatModelList.find((d) => d.value === form.repeatModel)?.label}
                />
              </AtList>
            </Picker>

            {Number(form.repeatModel) === 1 && (
              <Picker value={form.runDate} mode="date" onChange={(e) => this.handleDateChange(e, 'runDate')}>
                <AtList>
                  <AtListItem title="选择日期" arrow="down" extraText={form.runDate} />
                </AtList>
              </Picker>
            )}
            {Number(form.repeatModel) === 2 && (
              <View>
                <View className="row-title">
                  <View>选择日期</View>
                </View>
                <AtCheckbox
                  options={weekList}
                  selectedList={form.repeatWeek || []}
                  onChange={(value) => this.handleCheckboxChange(value)}
                />
              </View>
            )}

            <Picker value={form.startAt} mode="time" onChange={(e) => this.handleDateChange(e, 'startAt')}>
              <AtList>
                <AtListItem title="选择开始时间" arrow="down" extraText={form.startAt} />
              </AtList>
            </Picker>
            <Picker value={form.endAt} mode="time" onChange={(e) => this.handleDateChange(e, 'endAt')}>
              <AtList>
                <AtListItem title="选择结束时间" arrow="down" extraText={form.endAt} />
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
              value={form.totalPeople}
              onChange={(value) => this.handleChange(value, 'totalPeople')}
            />
            <View className="title">
              <View className="name">价格设置</View>
              <View className="tips">1、设置原价和折扣价后，系统将自动计算折扣。</View>
              <View className="tips">2、折扣价必须小于等于原价（相等则视为无折扣）。</View>
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

export default MatchEditPage;
