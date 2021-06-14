import React, { Component } from 'react';
import { View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';
import './index.scss';

interface IState {
  userInfo: any;
}

class MePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
    };
  }

  componentDidShow() {
    this.setState({
      userInfo: Taro.getStorageSync('userInfo') || '',
    });
  }

  loginFun() {
    Taro.navigateTo({
      url: '../login/index',
    });
  }

  jumpOrder() {
    const token = Taro.getStorageSync('token');
    if (!token) {
      this.loginFun();
      return;
    }
    Taro.navigateTo({
      url: '../orderList/index',
    });
  }

  render() {
    const { userInfo } = this.state;

    return (
      <View className="pageMine">
        <View className="mePage">
          <View className="head">
            {userInfo ? (
              <View className="loginBox">
                <AtIcon value="user" size="60" color="#6190e8"></AtIcon>
                <View className="info">
                  <View className="text">{userInfo.name}</View>
                  <View className="text">{userInfo.phoneNum}</View>
                </View>
              </View>
            ) : (
              <View className="loginBox" onClick={() => this.loginFun()}>
                <View className="noLogin">
                  <AtIcon value="user" size="60" color="#999"></AtIcon>
                </View>
                <View className="username">点击登录</View>
              </View>
            )}
          </View>
          <View className="nav">
            <View className="panel">
              <View className="title">我的服务</View>
              <View className="list">
                <View className="item" onClick={() => this.jumpOrder()}>
                  <AtIcon value="list" size="24" color="#333"></AtIcon>
                  <View className="label">我的订单</View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default MePage;
