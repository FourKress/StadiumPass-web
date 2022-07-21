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
    const authIds = Taro.getStorageSync('authIds') || [];
    if (userInfo?.bossId || authIds.length) {
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

  async jumpDetails(stadium) {
    if (!(await LoginService.checkLogin())) return;
    await Taro.navigateTo({
      url: `/boss/pages/stadium-details/index?id=${stadium.id}&bossId=${stadium.bossId}`,
    });
  }

  async changeIdentity() {
    Taro.setStorageSync('auth', 'client');
    await Taro.reLaunch({
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
    this.setState({
      authorize: false,
    });
    if (status) {
      const userInfo = await LoginService.handleAuthorize(false);
      this.setState({
        userInfo,
        isUpload: false,
      });
    } else {
      setTimeout(() => {
        this.setState({
          isUpload: false,
        });
      }, 200);
    }
  }

  async jumpAbout() {
    await Taro.navigateTo({
      url: '/pages/about/index',
    });
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
                  <View className="item" onClick={() => this.jumpDetails(item)}>
                    <View className="icon icon-stadium"></View>
                    <Text className="label">{item.name}</Text>
                    <View className={userInfo?.bossId === item.bossId ? 'tag boss' : 'tag'}>
                      {userInfo?.bossId === item.bossId ? '场主' : '管理员'}
                    </View>
                    <AtIcon value="chevron-right" size="24" color="#333D44"></AtIcon>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="nav-list" style="margin-top: 16px;">
            <View className="panel">
              <View className="item" onClick={() => this.showUploadModel()}>
                <View className="icon reload">
                  <AtIcon value="reload" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">更新昵称和头像</Text>
                <View className="info">
                  <Text className="name"></Text>
                </View>
              </View>
            </View>
          </View>

          <View className="nav-list" style="margin-top: 16px;">
            <View className="panel">
              <View className="item" onClick={() => this.jumpAbout()}>
                <View className="icon reload">
                  <AtIcon value="phone" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">关于我们</Text>
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
            我要踢球
          </View>
        </View>

        <AuthorizeUserBtn
          authorize={authorize}
          upload={isUpload}
          onChange={(value) => this.handleUploadUser(value)}
          onUpload={(value) => this.handleUploadUser(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default BossMePage;
