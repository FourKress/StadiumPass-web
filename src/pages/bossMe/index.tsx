import React, { Component } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import {
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtBadge,
  AtInput,
} from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '../../services/loginService';
import AuthorizeUserBtn from '../../components/authorizeUserModal';
import { validateRegular } from '../../utils/validateRule';

import './index.scss';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IOrderCount {
  payCount: number;
  startCount: number;
  allCount: number;
}

interface IState {
  userInfo: any;
  isOpened: boolean;
  authorize: boolean;
  orderCount: IOrderCount;
  showPhoneModal: boolean;
  phoneNum: any;
}

@inject('tabBarStore')
@observer
class BossMePage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isOpened: false,
      authorize: false,
      showPhoneModal: false,
      orderCount: {
        payCount: 0,
        startCount: 0,
        allCount: 0,
      },
      phoneNum: '',
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(2);
    const userInfo = Taro.getStorageSync('userInfo') || '';
    this.setState(
      {
        userInfo,
      },
      () => {
        if (!userInfo?.id) {
          return;
        }
        this.getOrderCount();
      }
    );
  }

  getOrderCount() {
    requestData({
      method: 'GET',
      api: '/order/listCount',
    }).then((res: any) => {
      this.setState({
        orderCount: res,
      });
    });
  }

  getOpenId(code) {
    return requestData({
      method: 'GET',
      api: '/wx/code2Session',
      params: {
        code,
      },
    });
  }

  checkLogin() {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
      });
    }
    return token;
  }

  jumpOrder(index) {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `../order/index?index=${index}`,
    });
  }

  jumpMonthlyCard() {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `../monthlyCard/index`,
    });
  }

  jumpMyWatch() {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `../myWatch/index`,
    });
  }

  handlePhoneModal(status) {
    if (status) {
      if (!this.checkLogin()) return;
      this.setState({
        phoneNum: this.state.userInfo.phoneNum,
      });
    }
    this.setState({
      showPhoneModal: status,
    });
  }

  changePhoneNum() {
    const { userInfo, phoneNum } = this.state;
    if (!validateRegular.phone.test(phoneNum)) {
      Taro.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    requestData({
      method: 'POST',
      api: '/user/modify',
      params: {
        phoneNum,
      },
    }).then((res) => {
      this.setState({
        userInfo: {
          ...userInfo,
          phoneNum,
        },
      });
      Taro.setStorageSync('userInfo', res);
      this.handlePhoneModal(false);
    });
  }

  handlePhoneNum(value) {
    this.setState({
      phoneNum: value,
    });
  }

  handleConfirm() {
    this.changeIdentity(false);
  }

  changeIdentity(status) {
    this.setState({
      isOpened: status,
    });
  }

  async handleLogin() {
    const userInfo = await LoginService.login();
    if (!userInfo) {
      this.setState({
        authorize: true,
      });
      return;
    }
    this.setState({
      userInfo,
    });
  }

  async handleAuthorize(status) {
    if (!status) {
      this.setState({
        authorize: status,
      });
      return;
    }
    const userInfo = await LoginService.handleAuthorize();
    this.setState({
      userInfo,
      authorize: false,
    });
  }

  render() {
    const {
      userInfo,
      isOpened,
      orderCount,
      authorize,
      showPhoneModal,
      phoneNum,
    } = this.state;

    return (
      <View className="mePage">
        <View className="head">
          {userInfo ? (
            <View className="loginBox">
              <View className="box">
                <Image className="avatar" src={userInfo.avatarUrl}></Image>
                <AtIcon
                  className="member"
                  value="user"
                  size="20"
                  color="#fff"
                ></AtIcon>
              </View>
              <View className="text">{userInfo.nickName}</View>
              <Text>本月组队：{userInfo.teamUpCount}次</Text>
            </View>
          ) : (
            <View className="loginBox">
              <AtIcon
                onClick={() => this.handleLogin()}
                value="user"
                size="60"
                color="#fff"
              ></AtIcon>
              <View className="text">
                <View onClick={() => this.handleLogin()}>点击登录</View>
              </View>
            </View>
          )}
        </View>

        <View className="main">
          <View className="order-nav">
            <View className="item" onClick={() => this.jumpOrder(0)}>
              {orderCount.payCount ? (
                <AtBadge value={orderCount.payCount} maxValue={99}>
                  <View className="icon"></View>
                </AtBadge>
              ) : (
                <View className="icon"></View>
              )}
              <Text className="name">待付款</Text>
            </View>
            <View className="item" onClick={() => this.jumpOrder(1)}>
              {orderCount.startCount ? (
                <AtBadge value={orderCount.startCount} maxValue={99}>
                  <View className="icon"></View>
                </AtBadge>
              ) : (
                <View className="icon"></View>
              )}
              <Text className="name">待开始</Text>
            </View>
            <View className="item" onClick={() => this.jumpOrder(2)}>
              {orderCount.allCount ? (
                <AtBadge value={orderCount.allCount} maxValue={99}>
                  <View className="icon"></View>
                </AtBadge>
              ) : (
                <View className="icon"></View>
              )}
              <Text className="name">全部订单</Text>
            </View>
          </View>

          <View className="nav-list">
            <View className="panel">
              <View className="item" onClick={() => this.jumpMonthlyCard()}>
                <View className="icon"></View>
                <Text className="label">场馆月卡</Text>
                <View className="info">
                  {userInfo.monthlyCardCount > 0 && (
                    <Text className="name">
                      已开通：{userInfo.monthlyCardCount}张
                    </Text>
                  )}
                  <AtIcon
                    value="chevron-right"
                    size="24"
                    color="#333D44"
                  ></AtIcon>
                </View>
              </View>
            </View>
            <View className="panel">
              <View className="item" onClick={() => this.jumpMyWatch()}>
                <View className="icon"></View>
                <Text className="label">我的关注</Text>
                <View className="info">
                  <Text className="name"></Text>
                  <AtIcon
                    value="chevron-right"
                    size="24"
                    color="#333D44"
                  ></AtIcon>
                </View>
              </View>
              <View
                className="item"
                onClick={() => this.handlePhoneModal(true)}
              >
                <View className="icon"></View>
                <Text className="label">联系电话</Text>
                <View className="info">
                  <Text className="name">{userInfo.phoneNum}</Text>
                  <AtIcon
                    value="chevron-right"
                    size="24"
                    color="#333D44"
                  ></AtIcon>
                </View>
              </View>
            </View>
          </View>
        </View>

        {userInfo.id && (
          <View className="footer-btn">
            <View className="btn" onClick={() => this.changeIdentity(true)}>
              <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
              我是场主
            </View>
          </View>
        )}

        <AtModal isOpened={isOpened}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            {userInfo.isBoss ? (
              <View>
                <View className="row">是否切换为场主模式？</View>
              </View>
            ) : (
              <View>
                <AtIcon
                  className="row"
                  value="close-circle"
                  size="24"
                  color="#FF2000"
                ></AtIcon>
                <View className="row">对不起，您还未认证场主！</View>
                <View className="row">如要认证场主，请联系：15523250903</View>
              </View>
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.changeIdentity(false)}>取消</Button>
            <Button onClick={() => this.handleConfirm()}>确定</Button>
          </AtModalAction>
        </AtModal>

        <AtModal isOpened={showPhoneModal}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            {showPhoneModal && (
              <AtInput
                className="phoneNum"
                name="value"
                title="联系电话"
                type="number"
                maxlength={11}
                placeholder="请输入联系电话"
                value={phoneNum}
                onChange={(value) => this.handlePhoneNum(value)}
              />
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.handlePhoneModal(false)}>取消</Button>
            <Button onClick={() => this.changePhoneNum()}>确定</Button>
          </AtModalAction>
        </AtModal>

        <AuthorizeUserBtn
          authorize={authorize}
          onChange={(value) => this.handleAuthorize(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default BossMePage;
