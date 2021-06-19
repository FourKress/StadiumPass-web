import React, { Component } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import {
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtBadge,
} from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

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
}

class MePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isOpened: false,
      authorize: false,
      orderCount: {
        payCount: 0,
        startCount: 0,
        allCount: 0,
      },
    };
  }

  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    this.setState(
      {
        userInfo: Taro.getStorageSync('userInfo') || '',
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

  handleLogin() {
    Taro.login()
      .then((res) => {
        if (res.code) {
          // 发起网络请求;
          return this.getOpenId(res.code);
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      })
      .then((res: any) => {
        Taro.setStorageSync('openId', res.openid);
        return this.checkFirstLogin(res.openid);
      })
      .then((res: any) => {
        if (res) {
          return this.sendLogin(res.openId);
        } else {
          console.log('第一次登陆');
          this.authorizeUserInfo(true);
          return Promise.reject('第一次登陆');
        }
      })
      .then((res: any) => {
        console.log(res);
        this.saveUserInfo(res);
      })
      .catch((err) => {
        console.log('登录失败！' + err);
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

  sendLogin(openId, userInfo = {}) {
    return requestData({
      method: 'POST',
      api: '/auth/login',
      params: {
        openId,
        ...userInfo,
      },
    });
  }

  saveUserInfo(res) {
    Taro.setStorageSync('token', res.token);
    Taro.setStorageSync('userInfo', res.userInfo);
    this.setState({
      userInfo: res.userInfo,
    });
  }

  async checkFirstLogin(openId) {
    return requestData({
      method: 'GET',
      api: '/user/findOneByOpenId',
      params: {
        openId,
      },
    })
      .then((res) => {
        return Promise.resolve(res);
      })
      .catch(() => {
        return Promise.reject(false);
      });
  }

  authorizeUserInfo(status) {
    this.setState({
      authorize: status,
    });
  }

  handleAuthorize() {
    Taro.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang: 'zh_CN',
    })
      .then((res) => {
        const openId = Taro.getStorageSync('openId');
        return this.sendLogin(openId, res.userInfo);
      })
      .then((res) => {
        this.authorizeUserInfo(false);
        this.saveUserInfo(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  checkLogin() {
    Taro.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000,
    });
    return Taro.getStorageSync('token');
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

  handleConfirm() {
    this.changeIdentity(false);
  }

  changeIdentity(status) {
    this.setState({
      isOpened: status,
    });
  }

  render() {
    const { userInfo, isOpened, authorize, orderCount } = this.state;

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
              {orderCount.allCount ? (
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
              <View className="item">
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

        <AtModal isOpened={authorize}>
          <AtModalHeader>登陆提示</AtModalHeader>
          <AtModalContent>
            <View>
              <View className="row">
                当前是您第一次登录，为了给你更好的体验，请授权完善用户信息。
              </View>
            </View>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.authorizeUserInfo(false)}>取消</Button>
            <Button onClick={() => this.handleAuthorize()}>授权</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

export default MePage;
