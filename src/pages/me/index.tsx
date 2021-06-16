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

interface IState {
  userInfo: any;
  isOpened: boolean;
}

class MePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isOpened: false,
    };
  }

  componentDidShow() {
    this.setState(
      {
        userInfo: Taro.getStorageSync('userInfo') || '',
      },
      () => {
        this.getWatchList();
      }
    );
  }

  getWatchList() {
    requestData({
      method: 'GET',
      api: '/userRelationStadium/watchList',
      params: {
        userId: this.state.userInfo.id,
      },
    }).then((res: any) => {
      console.log(res);
    });
  }

  handleLogin() {
    Taro.login({
      success: (res) => {
        if (res.code) {
          // 发起网络请求;
          requestData({
            method: 'GET',
            api: '/wx/code2Session',
            params: {
              code: res.code,
            },
          }).then((data: any) => {
            console.log(data);
            requestData({
              method: 'POST',
              api: '/auth/login',
              params: {
                openId: data.openid,
              },
            }).then((data: any) => {
              console.log(data);
              Taro.setStorageSync('token', data.token);
              Taro.setStorageSync('userInfo', data.userInfo);
              this.setState({
                userInfo: data.userInfo,
              });
            });
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      },
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
    const { userInfo, isOpened } = this.state;

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
              <AtIcon value="user" size="60" color="#fff"></AtIcon>
              <View className="text" onClick={() => this.handleLogin()}>
                点击登录
              </View>
            </View>
          )}
        </View>

        <View className="main">
          <View className="order-nav">
            <View className="item">
              <AtBadge value={10} maxValue={99}>
                <View className="icon"></View>
              </AtBadge>
              <Text className="name">待付款</Text>
            </View>
            <View className="item">
              <AtBadge value={10} maxValue={99}>
                <View className="icon"></View>
              </AtBadge>
              <Text className="name">待开始</Text>
            </View>
            <View className="item">
              <AtBadge value={10} maxValue={99}>
                <View className="icon"></View>
              </AtBadge>
              <Text className="name">全部订单</Text>
            </View>
          </View>

          <View className="nav-list">
            <View className="panel">
              <View className="item">
                <View className="icon"></View>
                <Text className="label">场馆月卡</Text>
                <View className="info">
                  <Text className="name">已开通：一张</Text>
                  <AtIcon
                    value="chevron-right"
                    size="24"
                    color="#333D44"
                  ></AtIcon>
                </View>
              </View>
            </View>
            <View className="panel">
              <View className="item">
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

        <View className="footer-btn">
          <View className="btn" onClick={() => this.changeIdentity(true)}>
            <AtIcon value="repeat-play" size="18" color="#333D44"></AtIcon>
            我是场主
          </View>
        </View>

        <AtModal isOpened={isOpened}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            {/*<View>*/}
            {/*  <AtIcon className={'row'} value='close-circle' size='24' color='#FF2000'></AtIcon>*/}
            {/*  <View className={'row'}>对不起，您还未认证场主！</View>*/}
            {/*  <View className={'row'}>如要认证场主，请联系：15523250903</View>*/}
            {/*</View>*/}
            <View>
              <View className="row">是否切换为场主模式？</View>
            </View>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.changeIdentity(false)}>取消</Button>
            <Button onClick={() => this.handleConfirm()}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

export default MePage;
