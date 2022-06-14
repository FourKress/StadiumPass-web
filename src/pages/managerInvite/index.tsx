import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';

import './index.scss';

import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';

interface IState {
  authorize: boolean;
  stadiumInfo: any;
  userInfo: any;
}

class ManagerInvite extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      authorize: false,
      stadiumInfo: {},
    };
  }

  async componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.id + '').toString();
    await this.getStadiumInfo(stadiumId);
  }

  async getStadiumInfo(id) {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id,
      },
    }).then((res: any) => {
      this.setState({
        stadiumInfo: res,
      });
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
      authorize: false,
      userInfo,
    });
  }

  async jump() {
    await Taro.setStorageSync('auth', 'boss');
    await Taro.reLaunch({
      url: '/boss/pages/revenue/index',
    });
  }

  render() {
    const { authorize, stadiumInfo } = this.state;

    return (
      <View className="manager-invite-page">
        <View className="tips">
          <View>
            <Text className="name">“{stadiumInfo.name}反倒是顺丰阿萨德”</Text>
          </View>
          <View>
            <Text>邀请您成为球场管理员</Text>
          </View>
        </View>
        <View className="btn" onClick={() => this.handleLogin()}>
          同意成为管理员
        </View>

        <AuthorizeUserBtn authorize={authorize} onChange={(value) => this.handleAuthorize(value)}></AuthorizeUserBtn>
      </View>
    );
  }
}

export default ManagerInvite;
