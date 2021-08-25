import React, { Component } from 'react';
import { Text, View } from '@tarojs/components';
import {
  AtForm,
  AtInput,
  AtTextarea,
  AtTabBar,
  AtSwitch,
  AtIcon,
} from 'taro-ui';
import Taro from '@tarojs/taro';
// import requestData from '@/utils/requestData';

import './index.scss';

interface IState {
  list: Array<any>;
  current: number;
  stadiumInfo: any;
  spaceInfo: any;
  spaceList: Array<any>;
  showSpaceDetails: boolean;
}

class StadiumDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      list: [],
      stadiumInfo: {},
      spaceList: [],
      spaceInfo: {},
      showSpaceDetails: false,
    };
  }

  handleClick(index) {
    this.setState({
      current: index,
    });
  }

  jumpDetails(item) {
    console.log(item);
    Taro.navigateTo({
      url: '../sequence-details/index',
    });
  }

  jumpFailStadium() {
    Taro.navigateTo({
      url: '../fail-stadium/index',
    });
  }

  handleChange(value, key) {
    const stadiumInfo = this.state.stadiumInfo;
    stadiumInfo[key] = value;
    console.log(stadiumInfo, value, key);
    this.setState({
      stadiumInfo: {
        ...stadiumInfo,
      },
    });
  }

  addSpace() {
    this.setState({
      showSpaceDetails: true,
    });
  }

  handleSpaceEdit(space) {
    console.log(space);
  }

  handleSpaceChange(value, key) {
    const spaceInfo = this.state.spaceInfo;
    spaceInfo[key] = value;
    console.log(spaceInfo, value, key);
    this.setState({
      spaceInfo: {
        ...spaceInfo,
      },
    });
  }

  render() {
    const { current, stadiumInfo, spaceList, spaceInfo, showSpaceDetails } =
      this.state;

    return (
      <View className="stadium-details-page">
        <AtTabBar
          tabList={[{ title: '场次设置' }, { title: '场馆设置' }]}
          onClick={(index) => this.handleClick(index)}
          current={current}
        />
        {current === 0 && (
          <View className="list">
            <View className="scroll-warp">
              {[1, 2, 3, 4, 5, 6].map((item) => {
                return (
                  <View className="item" onClick={() => this.jumpDetails(item)}>
                    <View className="top">
                      <View className="left">重复场次</View>
                      <View className="right">
                        <View className="money">
                          <Text>￥30</Text>
                          <Text className="discount">5折</Text>
                          <Text>/人；</Text>
                        </View>
                        <Text className="err">不支持月卡</Text>
                      </View>
                    </View>
                    <View className="item-body">
                      <View>场地：撒娇的尽可能</View>
                      <View>场地：撒娇的尽可能</View>
                      <View>场地：撒娇的尽可能</View>
                      <View>场地：撒娇的尽可能</View>
                      <View>场地：撒娇的尽可能</View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {current === 1 && (
          <View className="list stadium">
            <View className="scroll-warp">
              <AtForm className="form">
                <View className="title">
                  <View className="name">场地设置</View>
                </View>
                {spaceList.length > 0 ? (
                  spaceList.map((item) => {
                    return (
                      <AtInput
                        name="duration"
                        title={item.name}
                        type="text"
                        editable={false}
                        value={item.unit}
                        onChange={() => this.handleSpaceEdit(item)}
                      />
                    );
                  })
                ) : (
                  <View className="add" onClick={() => this.addSpace()}>
                    <AtIcon value="add" size="14" color="#0080FF"></AtIcon>
                    <View>新增场地</View>
                  </View>
                )}

                <View className="title">
                  <View className="name">月卡设置</View>
                </View>
                <AtSwitch
                  title="支持月卡"
                  color="#00E36A"
                  checked={stadiumInfo.monthlyCardStatus}
                  onChange={(value) =>
                    this.handleChange(value, 'monthlyCardStatus')
                  }
                />
                <AtInput
                  name="monthlyCardPrice"
                  title="购买金额"
                  type="text"
                  placeholder="请输入月卡购买金额"
                  value={stadiumInfo.monthlyCardPrice}
                  onChange={(value) =>
                    this.handleChange(value, 'monthlyCardPrice')
                  }
                />
                <View className="title">
                  <View className="name">场馆介绍</View>
                </View>
                <AtInput
                  name="name"
                  title="场馆名称"
                  type="text"
                  placeholder="请输入场馆名称"
                  value={stadiumInfo.name}
                  onChange={(value) => this.handleChange(value, 'name')}
                />
                <AtInput
                  name="rebatePrice"
                  title="所在地区"
                  type="text"
                  placeholder="请选择所在地区"
                  value={stadiumInfo.rebatePrice}
                  onChange={(value) => this.handleChange(value, 'rebatePrice')}
                />
                <AtInput
                  name="address"
                  title="详细地址"
                  type="text"
                  placeholder="请输入详细地址"
                  value={stadiumInfo.address}
                  onChange={(value) => this.handleChange(value, 'address')}
                />
                <AtInput
                  name="phoneNum"
                  title="联系电话"
                  type="text"
                  placeholder="请输入联系电话"
                  value={stadiumInfo.phoneNum}
                  onChange={(value) => this.handleChange(value, 'phoneNum')}
                />
                <View className="row-title">
                  <View>场馆说明</View>
                </View>
                <AtTextarea
                  maxLength={200}
                  placeholder="请输入场馆说明"
                  value={stadiumInfo.description}
                  onChange={(value) => this.handleChange(value, 'description')}
                />
              </AtForm>
            </View>
          </View>
        )}
        {current === 0 && (
          <View className="btn-list">
            <View className="btn" onClick={() => this.jumpFailStadium()}>
              已失效场次
            </View>
            <View className="btn">新建场次</View>
          </View>
        )}
        {current === 1 && (
          <View className="btn-list">
            <View className="save btn">保存</View>
          </View>
        )}

        {showSpaceDetails && (
          <View className="space-details">
            <AtForm className="form">
              <AtInput
                name="spaceName"
                title="场地名称"
                type="text"
                placeholder="请输入场地名称"
                value={spaceInfo.name}
                onChange={(value) => this.handleSpaceChange(value, 'name')}
              />
              <AtInput
                name="spaceUnit"
                title="对局规格"
                type="text"
                placeholder="请输入对局规格"
                value={spaceInfo.unit}
                onChange={(value) => this.handleSpaceChange(value, 'unit')}
              />
            </AtForm>
            <View className="space-add">
              <View className="btn">删除场地</View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default StadiumDetailsPage;
