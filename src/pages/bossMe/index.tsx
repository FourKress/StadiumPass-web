import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '../../services/loginService';
import AuthorizeUserBtn from '../../components/authorizeUserModal';

import './index.scss';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

interface IState {
  userInfo: any;
  authorize: boolean;
  stadiumList: Array<any>;
}

@inject('tabBarStore')
@observer
class BossMePage extends Component<InjectStoreProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      authorize: false,
      stadiumList: [],
    };
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  componentDidShow() {
    this.inject.tabBarStore.setSelected(2);
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if (userInfo.isBoss) {
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
      url: `../stadium-details/index?id=${id}`,
    });
  }

  changeIdentity() {
    Taro.reLaunch({
      url: '../stadium/index',
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
    const { userInfo, authorize, stadiumList } = this.state;

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
          <View className="title">我的球场</View>
          <View className="nav-list">
            {stadiumList.map((item) => {
              return (
                <View className="panel">
                  <View
                    className="item"
                    onClick={() => this.jumpDetails(item.id)}
                  >
                    <View className="icon"></View>
                    <Text className="label">{item.name}</Text>
                    <AtIcon
                      value="chevron-right"
                      size="24"
                      color="#333D44"
                    ></AtIcon>
                  </View>
                </View>
              );
            })}
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
          onChange={(value) => this.handleAuthorize(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default BossMePage;
