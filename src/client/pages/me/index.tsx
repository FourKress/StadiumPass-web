import React, { Component } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import { AtIcon, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtBadge } from 'taro-ui';
import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import * as LoginService from '@/services/loginService';
import AuthorizeUserBtn from '@/components/authorizeUserModal';
import AuthorizePhoneBtn from '@/components/authorizePhoneBtn';

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
  isUpload: boolean;
}

class MePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isOpened: false,
      authorize: false,
      isUpload: false,
      orderCount: {
        payCount: 0,
        startCount: 0,
        allCount: 0,
      },
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
        this.getUserInfo();
      }
    );
  }

  getUserInfo() {
    requestData({
      method: 'GET',
      api: '/user/findOneById',
    }).then((res: any) => {
      this.setState({
        userInfo: res,
      });
    });
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

  async jumpOrder(index) {
    if (!(await LoginService.checkLogin())) return;
    await Taro.navigateTo({
      url: `/client/pages/order/index?index=${index}`,
    });
  }

  async jumpMonthlyCard() {
    if (!(await LoginService.checkLogin())) return;
    await Taro.navigateTo({
      url: `/client/pages/monthlyCard/index`,
    });
  }

  async jumpMyWatch() {
    if (!(await LoginService.checkLogin())) return;
    await Taro.navigateTo({
      url: `/client/pages/myWatch/index`,
    });
  }

  async handleConfirm() {
    await this.changeIdentity(false);
    const { userInfo } = this.state;
    const authIds = Taro.getStorageSync('authIds');
    if (userInfo?.bossId || authIds?.length) {
      await Taro.setStorageSync('auth', 'boss');
      await Taro.reLaunch({
        url: '/boss/pages/revenue/index',
      });
      return;
    }
    this.handleApplyForBoss();
  }

  handleApplyForBoss() {
    requestData({
      method: 'GET',
      api: '/user/applyForBoss',
    }).then(async () => {
      await Taro.showModal({
        title: '提示',
        content: '申请成功,后续会有工作人员电话联系您,请注意接听电话!',
        showCancel: false,
      });
    });
  }

  async changeIdentity(status) {
    if (!(await LoginService.checkLogin())) return;
    const { userInfo } = this.state;
    if (!userInfo.phoneNum) {
      await Taro.showToast({
        title: '请先完善联系电话!',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
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
      setTimeout(() => {
        this.setState({
          isUpload: status,
        });
      }, 200);
      return;
    }
    const userInfo = await LoginService.handleAuthorize();
    this.setState({
      userInfo,
      authorize: false,
    });
  }

  async handlePhoneAuthSuccess() {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    this.setState({
      userInfo: {
        ...userInfo,
      },
    });
    await this.changeIdentity(true);
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
    }
  }

  async jumpAbout() {
    await Taro.navigateTo({
      url: '/pages/about/index',
    });
  }

  render() {
    const { userInfo, isOpened, orderCount, authorize, isUpload } = this.state;
    const authIds = Taro.getStorageSync('authIds');

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
              <Text className="count">本月组队：{userInfo.teamUpCount}次</Text>
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
            </View>

            <View className="panel">
              <View className="item" onClick={() => this.showUploadModel()}>
                <View className="icon">
                  <AtIcon value="reload" color="#A4AAAE" size="24"></AtIcon>
                </View>
                <Text className="label">更新昵称和头像</Text>
                <View className="info">
                  <Text className="name"></Text>
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
        </View>

        <View className="footer-btn">
          {userInfo?.id && !userInfo?.phoneNum ? (
            <AuthorizePhoneBtn onAuthSuccess={() => this.handlePhoneAuthSuccess()}>
              <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
              {userInfo?.bossId || authIds?.length ? '组织踢球' : '申请组织踢球'}
            </AuthorizePhoneBtn>
          ) : (
            <View className="btn" onClick={() => this.changeIdentity(true)}>
              <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
              {userInfo?.bossId || authIds?.length ? '组织踢球' : '申请组织踢球'}
            </View>
          )}
        </View>

        <AtModal isOpened={isOpened}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            {userInfo?.bossId || authIds?.length ? (
              <View>
                <View className="row">是否切换为组织模式？</View>
              </View>
            ) : (
              <View>
                <AtIcon className="row" value="close-circle" size="24" color="#FF2000"></AtIcon>
                <View className="row">对不起，您还没有组织权限！</View>
                <View className="row">是否要申请组织权限</View>
              </View>
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.changeIdentity(false)}>取消</Button>
            <Button onClick={() => this.handleConfirm()}>确定</Button>
          </AtModalAction>
        </AtModal>

        <AuthorizeUserBtn
          authorize={authorize}
          upload={isUpload}
          onChange={(value) => this.handleAuthorize(value)}
          onUpload={(value) => this.handleUploadUser(value)}
        ></AuthorizeUserBtn>
      </View>
    );
  }
}

export default MePage;
