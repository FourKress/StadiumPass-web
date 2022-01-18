import React, { Component } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import { AtIcon, AtInput, AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '@/services/loginService';

import './index.scss';

import { validateRegular } from '@/utils/validateRule';

interface IState {
  userInfo: any;
  stadiumList: Array<any>;
  bossPhoneNum: string;
  showPhoneModal: boolean;
}

class BossMePage extends Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      bossPhoneNum: '',
      showPhoneModal: false,
      stadiumList: [],
    };
  }

  componentWillMount() {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (userInfo.bossId) {
      requestData({
        method: 'GET',
        api: '/stadium/stadiumList',
      }).then((res: any) => {
        this.setState({
          stadiumList: res,
        });
      });
    }
    this.setState({
      userInfo,
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

  jumpDetails(id) {
    if (!this.checkLogin()) return;
    Taro.navigateTo({
      url: `/boss/pages/stadium-details/index?id=${id}`,
    });
  }

  jumpCustomer() {
    Taro.navigateTo({
      url: '/boss/pages/myClient/index',
    });
  }

  changeIdentity() {
    Taro.setStorageSync('auth', 'client');
    Taro.reLaunch({
      url: '/client/pages/waitStart/index',
    });
  }

  async handleLogin() {
    const userInfo: any = await LoginService.login();
    if (!userInfo?.id) {
      return;
    }
    this.setState({
      userInfo,
    });
  }

  handlePhoneModal(status) {
    if (status) {
      if (!this.checkLogin()) return;
      this.setState({
        bossPhoneNum: this.state.userInfo.bossPhoneNum,
      });
    }
    this.setState({
      showPhoneModal: status,
    });
  }

  changePhoneNum() {
    const { userInfo, bossPhoneNum } = this.state;
    if (!validateRegular.phone.test(bossPhoneNum)) {
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
        bossPhoneNum,
        phoneNum: userInfo?.phoneNum || bossPhoneNum,
      },
    }).then((res) => {
      this.setState({
        userInfo: {
          ...userInfo,
          bossPhoneNum,
        },
      });
      Taro.setStorageSync('userInfo', res);
      this.handlePhoneModal(false);
    });
  }

  handlePhoneNum(value) {
    this.setState({
      bossPhoneNum: value,
    });
  }

  render() {
    const { userInfo, stadiumList, bossPhoneNum, showPhoneModal } = this.state;

    return (
      <View className="bossPage">
        <View className="head">
          {userInfo?.openId ? (
            <View className="loginBox">
              <View className="box">
                <Image className="avatar" src={userInfo.avatarUrl}></Image>
                <View className="member"></View>
              </View>
              <View className="text">{userInfo.nickName}</View>
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
          <View className="title">我的球场</View>
          <View className="nav-list">
            {stadiumList.map((item) => {
              return (
                <View className="panel">
                  <View className="item" onClick={() => this.jumpDetails(item.id)}>
                    <View className="icon"></View>
                    <Text className="label">{item.name}</Text>
                    <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="nav-list" style="margin-top: 16px;">
            <View className="panel">
              <View className="item" onClick={() => this.jumpCustomer()}>
                <View className="icon">
                  <AtIcon value="star-2" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">我的顾客</Text>
                <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
              </View>
            </View>
            <View className="panel">
              <View className="item" onClick={() => this.handlePhoneModal(true)}>
                <View className="icon">
                  <AtIcon value="iphone" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">联系电话</Text>
                <View className="info">
                  <Text className="name">{userInfo.bossPhoneNum}</Text>
                  <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="footer-btn">
          <View className="btn" onClick={() => this.changeIdentity()}>
            <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
            切换为用户
          </View>
        </View>

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
                value={bossPhoneNum}
                onChange={(value) => this.handlePhoneNum(value)}
              />
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.handlePhoneModal(false)}>取消</Button>
            <Button onClick={() => this.changePhoneNum()}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

export default BossMePage;
