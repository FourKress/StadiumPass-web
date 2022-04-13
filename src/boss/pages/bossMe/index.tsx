import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '@/services/loginService';

import './index.scss';
import AuthorizeUserBtn from '@/components/authorizeUserModal';

interface IState {
  userInfo: any;
  stadiumList: Array<any>;
  authorize: boolean;
  isUpload: boolean;
}

class BossMePage extends Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      stadiumList: [],
      authorize: false,
      isUpload: false,
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

  showUploadModel() {
    this.setState({
      authorize: true,
      isUpload: true,
    });
  }

  async handleUploadUser(status) {
    this.setState(
      {
        authorize: false,
      },
      () => {
        this.setState({
          isUpload: false,
        });
      }
    );
    if (status) {
      const userInfo = await LoginService.handleAuthorize();
      this.setState({
        userInfo,
      });
    }
  }

  render() {
    const { userInfo, stadiumList, authorize, isUpload } = this.state;

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
          <View className="title">我的场馆</View>
          <View className="nav-list">
            {stadiumList.map((item) => {
              return (
                <View className="panel stadium-panel">
                  <View className="item" onClick={() => this.jumpDetails(item.id)}>
                    <View className="icon icon-stadium"></View>
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
          </View>

          <View className="nav-list" style="margin-top: 16px;">
            <View className="panel">
              <View className="item" onClick={() => this.showUploadModel()}>
                <View className="icon">
                  <AtIcon value="reload" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">更新用户信息</Text>
                <View className="info">
                  <Text className="name"></Text>
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

        <AuthorizeUserBtn
          authorize={authorize}
          upload={isUpload}
          onUpload={(value) => this.handleUploadUser(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default BossMePage;
