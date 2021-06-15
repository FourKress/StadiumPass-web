import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtButton } from 'taro-ui';
import requestData from '@/utils/requestData';

import './index.scss';

class Index extends Component {
  componentDidShow() {
    Taro.removeStorageSync('localData');
  }

  onGetUserInfo() {
    Taro.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang: 'zh_CN',
      success: (res) => {
        // this.setState({
        //   userInfo: res.userInfo,
        //   hasUserInfo: true,
        // });
        console.log(res.userInfo);

        Taro.login({
          success: function (r) {
            if (r.code) {
              // 发起网络请求;
              requestData({
                method: 'GET',
                api: '/wx/code2Session',
                params: {
                  code: r.code,
                },
              }).then((data: any) => {
                console.log(data);

                requestData({
                  method: 'POST',
                  api: '/user/modify',
                  params: {
                    openId: data.openid,
                    ...res.userInfo,
                    teamUpCount: 12,
                    id: '60c8721533d85da3dfd242c2',
                  },
                }).then((data) => {
                  console.log(data);
                });
              });
              console.log(r.code);
            } else {
              console.log('登录失败！' + res.errMsg);
            }
          },
        });
      },
    });
  }

  render() {
    return (
      <View className="indexPage">
        <AtButton onClick={() => this.onGetUserInfo()}>微信快捷登陆</AtButton>
      </View>
    );
  }
}

export default Index;
