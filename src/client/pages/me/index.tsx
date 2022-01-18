import React, { Component } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import { AtIcon, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtBadge, AtInput } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import { validateRegular } from '@/utils/validateRule';

import './index.scss';

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
  systemPhoneNum: string;
}

class MePage extends Component<{}, IState> {
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
      systemPhoneNum: '15523250903',
    };
  }

  componentWillMount() {
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
      url: `/client/pages/order/index?index=${index}`,
    });
  }

  jumpMonthlyCard() {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `/client/pages/monthlyCard/index`,
    });
  }

  jumpMyWatch() {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `/client/pages/myWatch/index`,
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
        bossPhoneNum: userInfo?.bossPhoneNum || phoneNum,
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
    const { userInfo, systemPhoneNum } = this.state;
    if (userInfo?.bossId) {
      Taro.setStorageSync('auth', 'boss');
      Taro.reLaunch({
        url: '/boss/pages/revenue/index',
      });
      return;
    }
    Taro.makePhoneCall({
      phoneNumber: systemPhoneNum,
    });
  }

  changeIdentity(status) {
    if (!this.checkLogin()) return;
    this.setState({
      isOpened: status,
    });
  }

  async handleLogin() {
    const userInfo: any = await LoginService.login();
    if (!userInfo?.id) {
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
    const { userInfo, isOpened, orderCount, authorize, showPhoneModal, phoneNum, systemPhoneNum } = this.state;

    return (
      <View className="mePage">
        <View className="head">
          {userInfo?.openId ? (
            <View className="loginBox">
              <View className="box">
                <Image className="avatar" src={userInfo.avatarUrl}></Image>
                <View className="member"></View>
              </View>
              <View className="text">{userInfo.nickName}</View>
              <Text>本月组队：{userInfo.teamUpCount}次</Text>
            </View>
          ) : (
            <View className="loginBox">
              <AtIcon onClick={() => this.handleLogin()} value="user" size="60" color="#fff"></AtIcon>
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
                  <View className="icon icon-1"></View>
                </AtBadge>
              ) : (
                <View className="icon icon-1"></View>
              )}
              <Text className="name">待付款</Text>
            </View>
            <View className="item" onClick={() => this.jumpOrder(1)}>
              {orderCount.startCount ? (
                <AtBadge value={orderCount.startCount} maxValue={99}>
                  <View className="icon icon-2"></View>
                </AtBadge>
              ) : (
                <View className="icon icon-2"></View>
              )}
              <Text className="name">待开始</Text>
            </View>
            <View className="item" onClick={() => this.jumpOrder(2)}>
              {orderCount.allCount ? (
                <AtBadge value={orderCount.allCount} maxValue={99}>
                  <View className="icon icon-3"></View>
                </AtBadge>
              ) : (
                <View className="icon icon-3"></View>
              )}
              <Text className="name">全部订单</Text>
            </View>
          </View>

          <View className="nav-list">
            <View className="panel">
              <View className="item" onClick={() => this.jumpMonthlyCard()}>
                <View className="icon card-icon"></View>
                <Text className="label">场馆月卡</Text>
                <View className="info">
                  {userInfo.monthlyCardCount > 0 && <Text className="name">已开通：{userInfo.monthlyCardCount}张</Text>}
                  <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                </View>
              </View>
            </View>
            <View className="panel">
              <View className="item" onClick={() => this.jumpMyWatch()}>
                <View className="icon">
                  <AtIcon value="star-2" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">我的关注</Text>
                <View className="info">
                  <Text className="name"></Text>
                  <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                </View>
              </View>
              <View className="item" onClick={() => this.handlePhoneModal(true)}>
                <View className="icon">
                  <AtIcon value="iphone" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">联系电话</Text>
                <View className="info">
                  <Text className="name">{userInfo.phoneNum}</Text>
                  <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="footer-btn">
          <View className="btn" onClick={() => this.changeIdentity(true)}>
            <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
            我是场主
          </View>
        </View>

        <AtModal isOpened={isOpened}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            {userInfo?.bossId ? (
              <View>
                <View className="row">是否切换为场主模式？</View>
              </View>
            ) : (
              <View>
                <AtIcon className="row" value="close-circle" size="24" color="#FF2000"></AtIcon>
                <View className="row">对不起，您还未认证场主！</View>
                <View className="row">如要认证场主，请联系：{systemPhoneNum}</View>
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

        <AuthorizeUserBtn authorize={authorize} onChange={(value) => this.handleAuthorize(value)}></AuthorizeUserBtn>
      </View>
    );
  }
}

export default MePage;
