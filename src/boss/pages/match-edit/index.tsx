import React, { Component } from 'react';
import { View, Picker } from '@tarojs/components';
import { AtForm, AtInput, AtList, AtListItem, AtCheckbox, AtSwitch, AtTabBar } from 'taro-ui';
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
  chargeModel: number | '';
  matchTotalAmt?: string;
  interval: number | '';
}

interface IState {
  stadiumId: string;
  matchId: string;
  form: IForm;
  spaceList: Array<any>;
  weekList: Array<any>;
  repeatModelList: Array<any>;
  chargeModelList: Array<any>;
  intervalList: Array<any>;
  tabList: Array<any>;
  rebateStatus: boolean;
  current: number;
}

const dateNow = () => dayjs().format('YYYY-MM-DD');
const chargeModelList = [
  { label: '单价模式', value: 2 },
  { label: '平摊模式', value: 1 },
];

// 最小包场时间
const intervalList = [
  { label: '半小时', value: 0.5 },
  { label: '一小时', value: 1 },
  { label: '一个半小时', value: 1.5 },
  { label: '二小时', value: 2 },
  { label: '二个半小时', value: 2.5 },
  { label: '三小时', value: 3 },
];

const tabList = [
  { title: '散场设置', value: 0 },
  { title: '包场设置', value: 1 },
];

class MatchEditPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      stadiumId: '',
      current: 0,
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
        repeatWeek: [],
        rebatePrice: '',
        price: '',
        chargeModel: '',
        matchTotalAmt: '',
        interval: '',
      },
      tabList,
      spaceList: [],
      weekList: [],
      repeatModelList: [],
      chargeModelList,
      intervalList,
      rebateStatus: false,
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
      const { repeatWeek, rebate, type } = res;
      const { form } = this.state;
      const tempForm = {};
      Object.keys(form).map((k) => {
        tempForm[k] = res[k];
      });

      const targetBar = tabList.find((f) => f.value === type);

      Taro.setNavigationBarTitle({
        title: `场次详情-${targetBar?.title}`,
      });

      this.setState({
        current: type,
        tabList: [targetBar],
        form: {
          ...form,
          ...tempForm,
          repeatWeek: repeatWeek.map((d) => Number(d)),
          rebate: res.rebate,
          id: res.id,
        },
        rebateStatus: rebate !== 10,
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

    const { rebateStatus } = this.state;

    if (rebateStatus) {
      if (form.rebatePrice && form.price) {
        if (!this.checkPrice(form.rebatePrice, form.price)) {
          form[key] = '';
        } else {
          form.rebate = parseFloat(((Number(form.rebatePrice) / Number(form.price)) * 10).toFixed(2));
        }
      }
    } else {
      form.rebatePrice = form.price;
      form.rebate = 10;
    }
    if ((key === 'matchTotalAmt' && form.minPeople) || (key === 'minPeople' && form.matchTotalAmt)) {
      const price = value ? (Number(form.matchTotalAmt) / Number(form.minPeople)).toFixed(2) : '';
      form.rebatePrice = price;
      form.price = price;
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
        form.runDate = value === 1 ? '' : dateNow();
      }
      if (key === 'chargeModel') {
        form.rebatePrice = '';
        form.price = '';
        form.matchTotalAmt = '';
      }
    }
    form[key] = value;
    this.setState({
      form: {
        ...form,
      },
    });
  }

  handleRebateStatus(value) {
    const form = this.state.form;
    let realForm;
    if (value) {
      realForm = {
        ...form,
        rebatePrice: '',
        rebate: '',
      };
    } else {
      realForm = {
        ...form,
        rebatePrice: form.price,
        rebate: 10,
      };
    }
    this.setState({
      rebateStatus: value,
      form: {
        ...realForm,
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
      } else if (this.state.current === 0) {
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
    const diff = dayjs(`${dateNow()} ${endAt}`)
      .startOf('minute')
      .diff(dayjs(`${dateNow()} ${startAt}`));
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

  async handleSave() {
    const { form, matchId, current } = this.state;

    const {
      repeatModel,
      rebate,
      price,
      rebatePrice,
      duration,
      startAt,
      endAt,
      repeatWeek,
      runDate,
      chargeModel,
      matchTotalAmt,
      interval,
    } = form;
    let { minPeople, totalPeople } = form;
    const key = Object.keys(form).find(
      (d) =>
        !form[d] &&
        !['repeatWeek', 'matchTotalAmt'].includes(d) &&
        (current === 0
          ? !['interval'].includes(d)
          : !['totalPeople', 'minPeople', 'chargeModel', 'duration'].includes(d))
    );

    const tips = `${current ? '包场' : '场次'}`;

    if ((parseInt(repeatModel) === 2 && !repeatWeek?.length) || (!matchTotalAmt && chargeModel === 1) || key) {
      await Taro.showToast({
        title: `请填写完整的${tips}信息, 不能为空`,
        icon: 'none',
      });
      return;
    }

    if (!this.checkDuration(startAt, endAt)) {
      return;
    }
    if (current === 0 && !this.checkPeople(totalPeople, minPeople)) {
      return;
    }
    if (!this.checkPrice(rebatePrice, price)) {
      return;
    }

    let realDate = runDate;
    if (parseInt(repeatModel) === 2) {
      const week = dayjs().day();
      if (!repeatWeek.includes(week ? week : 7)) {
        const stepArr = repeatWeek.map((d) => d - (week || 7));
        const stepPre: any = [];
        const stepNext = stepArr
          .filter((d) => {
            if (d > 0) {
              return true;
            } else {
              stepPre.push(d);
            }
          })
          .sort((a, b) => b - a);
        if (stepNext?.length) {
          realDate = dayjs().add(stepNext.reverse()[0], 'day').format('YYYY-MM-DD');
        } else {
          realDate = dayjs()
            .add(7 + stepPre.reverse()[0], 'day')
            .format('YYYY-MM-DD');
        }
      }
    }

    if (current === 1) {
      const day = dayjs().format('YYYY-MM-DD');
      const time = dayjs(`${day} ${endAt}`).valueOf() - dayjs(`${day} ${startAt}`).valueOf();
      const step = Math.floor(time / (1000 * 60 * 60 * Number(interval))).toString();
      totalPeople = step;
      minPeople = step;
    }

    const params = {
      ...form,
      repeatModel: Number(repeatModel),
      repeatWeek: repeatWeek || [],
      rebate: Number(rebate),
      price: Number(price),
      rebatePrice: Number(rebatePrice),
      runDate: realDate,
      totalPeople: Number(totalPeople),
      minPeople: Number(minPeople),

      ...(current === 1
        ? {
            interval: Number(interval),
            duration: undefined,
            chargeModel: undefined,
            type: 1,
          }
        : {
            duration: Number(duration),
            matchTotalAmt: Number(matchTotalAmt),
            interval: undefined,
            type: 0,
          }),
    };

    requestData({
      method: 'POST',
      api: matchId ? '/match/modify' : '/match/add',
      params,
    }).then(async () => {
      let message = '';
      if (matchId) {
        message = `${tips}保存成功`;
        if (Number(repeatModel) !== 1) {
          message += ',在新的重复日期上开始生效';
        }
      } else {
        message = `${tips}新建成功`;
      }
      await Taro.navigateBack({
        delta: -1,
      });
      await Taro.showToast({
        icon: 'none',
        title: message,
      });
    });
  }

  async handleDeleteSave() {
    const { form, matchId } = this.state;
    const { repeatModel } = form;
    await Taro.showModal({
      title: '提示',
      content: `确定删除该场次${Number(repeatModel) !== 1 ? '及其重复场次' : ''}吗？${
        Number(repeatModel) !== 1 ? '重复场次中' : ''
      }已有人报名的场次不会被删除。`,
      success: async (res) => {
        if (res.confirm) {
          requestData({
            method: 'GET',
            api: '/match/delete',
            params: {
              matchId,
            },
          }).then(async () => {
            await Taro.navigateBack({
              delta: -1,
            });
            await Taro.showToast({
              icon: 'none',
              title: '场次删除成功',
            });
          });
        }
      },
    });
  }

  async handleTabClick(index) {
    if (this.state.tabList.length === 1) return;
    const target = tabList.find((d) => d.value === index);
    if (this.state.current === target?.value) return;
    this.setState({
      current: target?.value ?? this.state.current,
    });
    const { form } = this.state;
    const data = {};
    Object.keys(form).forEach((k) => {
      if (k === 'stadiumId') return;
      data[k] = '';
      if (k === 'repeatWeek') {
        data[k] = [];
      }
    });
    this.setState({
      rebateStatus: false,
      form: {
        ...form,
        ...data,
      },
    });
  }

  render() {
    const { spaceList, repeatModelList, form, weekList, rebateStatus, current, tabList } = this.state;
    return (
      <View className="match-edit-page">
        <AtTabBar
          tabList={tabList}
          onClick={(index) => this.handleTabClick(index)}
          current={tabList.length > 1 ? current : 0}
        />
        {current === 0 && (
          <View className="scroll-wrap">
            <AtForm className="form">
              <Picker
                mode="selector"
                range={spaceList}
                rangeKey="name"
                onChange={(event) => this.handleSelectChange(event, 'spaceId')}
              >
                <AtList>
                  <AtListItem
                    title="场地"
                    arrow="down"
                    extraText={spaceList.find((d) => d.id === form.spaceId)?.name}
                  />
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
                <Picker
                  value={form.runDate}
                  start={dateNow()}
                  mode="date"
                  onChange={(e) => this.handleDateChange(e, 'runDate')}
                >
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
                <View className="tips">3、平摊模式下 单价 = 场次总价 / 最少人数, 系统自动计算。</View>
              </View>

              <Picker
                mode="selector"
                range={chargeModelList}
                rangeKey="label"
                onChange={(event) => this.handleSelectChange(event, 'chargeModel')}
              >
                <AtList>
                  <AtListItem
                    title="收费模式"
                    arrow="down"
                    extraText={chargeModelList.find((d) => d.value === form.chargeModel)?.label}
                  />
                </AtList>
              </Picker>
              {form.chargeModel === 1 && (
                <AtInput
                  name="matchTotalAmt"
                  title="场次总价"
                  type="text"
                  placeholder="请输入场次总价"
                  value={form.matchTotalAmt}
                  onChange={(value) => this.handleChange(value, 'matchTotalAmt')}
                />
              )}

              {form.chargeModel && (
                <AtInput
                  name="price"
                  title="单人原价"
                  type="text"
                  disabled={form.chargeModel === 1}
                  placeholder={form.chargeModel === 1 ? '系统自动计算' : '请输入单人原价'}
                  value={form.price}
                  onChange={(value) => this.handleChange(value, 'price')}
                />
              )}

              {form.chargeModel === 2 && (
                <AtSwitch
                  title="是否打折"
                  color="#00E36A"
                  checked={rebateStatus}
                  onChange={(value) => this.handleRebateStatus(value)}
                />
              )}

              {form.chargeModel && form.chargeModel === 2 && rebateStatus && (
                <AtInput
                  name="rebatePrice"
                  title="单人折扣价"
                  type="text"
                  placeholder="请输入单人折扣价"
                  value={form.rebatePrice}
                  onChange={(value) => this.handleChange(value, 'rebatePrice')}
                />
              )}
            </AtForm>
          </View>
        )}

        {current === 1 && (
          <View className="scroll-wrap">
            <AtForm className="form">
              <Picker
                mode="selector"
                range={spaceList}
                rangeKey="name"
                onChange={(event) => this.handleSelectChange(event, 'spaceId')}
              >
                <AtList>
                  <AtListItem
                    title="场地"
                    arrow="down"
                    extraText={spaceList.find((d) => d.id === form.spaceId)?.name}
                  />
                </AtList>
              </Picker>
              <View className="title">
                <View className="name">时间设置</View>
                <View className="tips">1、不重复：临时包场，只生效1次。</View>
                <View className="tips">2、每周重复：按周重复。例如可设置每周六、日重复的周末包场。</View>
                <View className="tips">3、每天重复：按天重复。例如可设置为每天重复的固定包场。</View>
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
                <Picker
                  value={form.runDate}
                  start={dateNow()}
                  mode="date"
                  onChange={(e) => this.handleDateChange(e, 'runDate')}
                >
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
                  <AtListItem title="场地开始时间" arrow="down" extraText={form.startAt} />
                </AtList>
              </Picker>
              <Picker value={form.endAt} mode="time" onChange={(e) => this.handleDateChange(e, 'endAt')}>
                <AtList>
                  <AtListItem title="场地结束时间" arrow="down" extraText={form.endAt} />
                </AtList>
              </Picker>

              <Picker
                mode="selector"
                range={intervalList}
                rangeKey="label"
                onChange={(event) => this.handleSelectChange(event, 'interval')}
              >
                <AtList>
                  <AtListItem
                    title="最小包场时间"
                    arrow="down"
                    extraText={intervalList.find((d) => d.value === form.interval)?.label}
                  />
                </AtList>
              </Picker>

              <View className="title">
                <View className="name">价格设置</View>
                <View className="tips">1、设置原价和折扣价后，系统将自动计算折扣。</View>
                <View className="tips">2、折扣价必须小于等于原价（相等则视为无折扣）。</View>
              </View>

              <AtInput
                name="price"
                title="包场原价"
                type="text"
                disabled={form.chargeModel === 1}
                placeholder="请输入包场原价"
                value={form.price}
                onChange={(value) => this.handleChange(value, 'price')}
              />

              <AtSwitch
                title="是否打折"
                color="#00E36A"
                checked={rebateStatus}
                onChange={(value) => this.handleRebateStatus(value)}
              />

              {rebateStatus && (
                <AtInput
                  name="rebatePrice"
                  title="包场折扣价"
                  type="text"
                  placeholder="请输入包场折扣价"
                  value={form.rebatePrice}
                  onChange={(value) => this.handleChange(value, 'rebatePrice')}
                />
              )}
            </AtForm>
          </View>
        )}

        <View className="btn-list">
          <View className="btn cancel" onClick={() => this.handleDeleteSave()}>
            删除场次
          </View>
          <View className="btn" onClick={() => this.handleSave()}>
            保存场次
          </View>
        </View>
      </View>
    );
  }
}

export default MatchEditPage;
