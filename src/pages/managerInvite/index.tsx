import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';

import './index.scss';

import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';
import { throttle } from 'lodash';

interface IState {
  authorize: boolean;
  inviteInfo: any;
  inviteId: string;
}

class ManagerInvite extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      authorize: false,
      inviteInfo: null,
      inviteId: '',
    };
  }

  async componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const inviteId = (pageParams.inviteId + '').toString();
    await this.setState({
      inviteId,
    });
    await this.getManagerInviteInfo(inviteId);
  }

  async getManagerInviteInfo(inviteId) {
    requestData({
      method: 'GET',
      api: '/stadium/getManagerInvite',
      params: {
        inviteId,
      },
    }).then((res: any) => {
      if (res?.error) {
        Taro.showModal({
          title: '提示',
          content: res?.msg,
          showCancel: false,
          success: async () => {
            await Taro.reLaunch({
              url: '/client/pages/waitStart/index',
            });
          },
        });
        return;
      }
      this.setState({
        inviteInfo: res,
      });
    });
  }

  handleThrottle = (fun) =>
    throttle(fun, 1000, {
      leading: true,
      trailing: false,
    });

  handleLogin = async () => {
    const userInfo: any = await LoginService.login();
    if (!userInfo?.id) {
      this.setState({
        authorize: true,
      });
      return;
    }
    await this.authManager();
  };

  async handleAuthorize(status) {
    if (!status) {
      this.setState({
        authorize: status,
      });
      return;
    }
    await LoginService.handleAuthorize();
    this.setState({
      authorize: false,
    });
    await this.authManager();
  }

  async authManager() {
    const params = this.state.inviteInfo;
    await Taro.showToast({ icon: 'none', duration: 0, title: '处理中...' });
    requestData({
      method: 'POST',
      api: '/manager/auth',
      params,
    })
      .then(async () => {
        await Taro.hideToast();
        await this.jump();
        await Taro.showToast({
          icon: 'none',
          title: '恭喜你成为管理员！',
        });
      })
      .catch(() => {
        Taro.hideToast();
      });
  }

  async jump() {
    await Taro.setStorageSync('auth', 'boss');
    await Taro.reLaunch({
      url: '/boss/pages/revenue/index',
    });
  }

  render() {
    const { authorize, inviteInfo } = this.state;

    return (
      <View>
        {inviteInfo ? (
          <View className="manager-invite-page">
            <View className="tips">
              <View>
                <Text className="name">“{inviteInfo?.stadiumName}”</Text>
              </View>
              <View>
                <Text>邀请您成为球场管理员</Text>
              </View>
            </View>
            <View className="btn" onClick={this.handleThrottle(this.handleLogin)}>
              同意成为管理员
            </View>

            <AuthorizeUserBtn
              authorize={authorize}
              onChange={(value) => this.handleAuthorize(value)}
            ></AuthorizeUserBtn>
          </View>
        ) : (
          <View></View>
        )}
      </View>
    );
  }
}

export default ManagerInvite;
