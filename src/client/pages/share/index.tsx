import React, { Component } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput } from 'taro-ui';

import './index.scss';
import requestData from '@/utils/requestData';
import { validateRegular } from '@/utils/validateRule';
import * as LoginService from '@/services/loginService';

interface IState {
  matchId: string;
  matchInfo: any;
  meHeaderPosition: any;
  unitList: any[];
  showApplyModal: boolean;
  phoneNum: any;
  stadiumName: string;
  userInfo: any;
}

class SharePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      matchId: '',
      matchInfo: {},
      meHeaderPosition: {},
      unitList: [],
      showApplyModal: false,
      phoneNum: '',
      stadiumName: '',
      userInfo: {},
    };
  }

  async componentDidShow() {
    this.setMeBtnPosition();
    // @ts-ignore
    // const matchId = Taro.getCurrentInstance().router.params.matchId + '';
    const matchId = '635d610240fc949500cbd746';
    const userInfo = Taro.getStorageSync('userInfo');
    this.getMatchInfo(matchId);
    await this.getUnitList();
    this.setState({
      matchId,
      userInfo,
    });
  }

  async getUnitList() {
    await requestData({
      method: 'GET',
      api: '/space/unitEnum',
    }).then((res: any) => {
      this.setState({
        unitList: res,
      });
    });
  }

  setMeBtnPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    this.setState({
      meHeaderPosition: {
        top: stateHeight,
      },
    });
  }

  getMatchInfo(id) {
    requestData({
      method: 'GET',
      api: '/match/details',
      params: {
        id,
      },
    }).then((res: any) => {
      this.setState({
        matchInfo: res,
      });
    });
  }

  async goBack() {
    await Taro.switchTab({
      url: '/client/pages/waitStart/index',
    });
  }

  async backHome() {
    await Taro.switchTab({
      url: '/client/pages/waitStart/index',
    });
  }

  handlePhoneNum(value) {
    this.setState({
      phoneNum: value,
    });
  }
  handleStadiumNum(value) {
    this.setState({
      stadiumName: value,
    });
  }

  applyBoss(status) {
    this.setState({
      showApplyModal: status,
      phoneNum: '',
      stadiumName: '',
    });
  }

  changePhoneNum() {
    const { phoneNum, stadiumName, userInfo } = this.state;
    if (!stadiumName) {
      Taro.showToast({
        title: '请输入球场名称',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    if (!validateRegular.phone.test(phoneNum)) {
      Taro.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    requestData({
      method: 'POST',
      api: '/user/setBoss',
      params: {
        id: userInfo.id,
      },
    }).then(async (res: any) => {
      await Taro.setStorageSync('userInfo', {
        ...res,
      });
      await requestData({
        method: 'POST',
        api: '/stadium/add',
        params: {
          bossId: res.bossId,
          phoneNum,
          name: stadiumName,
          address: '',
          stadiumUrls: [],
          remarks: '',
          description: '',
          city: '',
          province: '',
          country: '',
          spaces: [],
          district: '',
          longitude: 0,
          latitude: 0,
          wxGroup: '',
          wxGroupId: '',
          welcomeWords: '',
        },
      }).then(async () => {
        await LoginService.login(false);

        this.applyBoss(false);
        await Taro.reLaunch({
          url: '/boss/pages/revenue/index',
        });
        await Taro.showToast({
          icon: 'none',
          title: '组织者开通成功，请完善相关信息！',
        });
      });
    });
  }

  render() {
    const { matchInfo, meHeaderPosition, showApplyModal, phoneNum, stadiumName, userInfo } = this.state;
    const success = matchInfo.minPeople - matchInfo.selectPeople;
    const max = matchInfo.totalPeople - matchInfo.selectPeople;

    return (
      <View className="share-page">
        <View className="page-header" style={`padding-top: ${meHeaderPosition.top}px`}>
          <View className="header-panel">
            <AtIcon
              className="back-icon"
              value="chevron-left"
              size="24"
              color="#000"
              onClick={() => this.goBack()}
            ></AtIcon>
            <View className="page-title">
              <Text>支付成功</Text>
            </View>
          </View>
        </View>
        <View className="panel">
          <AtIcon value="check-circle" size="60" color="#00E36A"></AtIcon>
          <View className="title">{matchInfo.type === 1 ? '包场' : '报名'}成功</View>
          {matchInfo.type === 1 ? (
            <View className="tips">
              恭喜你，包场成功！{userInfo?.bossId ? '' : '点击成为组织者吧，帮助你更加方便快捷的组织队友一起踢球!'}
            </View>
          ) : (
            <View>
              {max > 0 ? (
                <View>
                  {success > 0 ? (
                    <View className="tips">还差{matchInfo.minPeople - matchInfo.selectPeople}人就组队成功了！</View>
                  ) : (
                    <View className="tips">还有{matchInfo.totalPeople - matchInfo.selectPeople}个空位可报名！</View>
                  )}
                  <View className="tips">{`${
                    success > 0 ? '为了提高成功率，' : '为了更精彩的比赛，'
                  }赶快邀请好友一起加入吧！`}</View>
                </View>
              ) : (
                <View>哇哦~，该场次已满场，尽情奔跑吧！</View>
              )}
            </View>
          )}
        </View>
        {matchInfo.type === 1 && !userInfo?.bossId && (
          <View className="apply-button" onClick={() => this.applyBoss(true)}>
            成为组织者
          </View>
        )}
        <View className="share-button" onClick={() => this.backHome()}>
          返回首页
        </View>

        <AtModal isOpened={showApplyModal}>
          <AtModalHeader>添加球场</AtModalHeader>
          <AtModalContent>
            {showApplyModal && (
              <AtInput
                className="phoneNum"
                name="stadiumName"
                title="球场名称"
                placeholder="请输入球场名称"
                value={stadiumName}
                onChange={(value) => this.handleStadiumNum(value)}
              />
            )}
            {showApplyModal && (
              <AtInput
                className="phoneNum"
                name="phoneNum"
                title="联系电话"
                type="number"
                maxlength={11}
                placeholder="请输入联系电话"
                value={phoneNum}
                onChange={(value) => this.handlePhoneNum(value)}
              />
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.applyBoss(false)}>取消</Button>
            <Button onClick={() => this.changePhoneNum()}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

export default SharePage;
