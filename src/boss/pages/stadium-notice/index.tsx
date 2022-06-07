import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';
import { AtSwitch, AtTextarea } from 'taro-ui';
import requestData from '@/utils/requestData';

interface IState {
  noticeStatus: boolean;
  noticeContent: string;
  stadiumId: string;
}

class StadiumNoticePage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      noticeContent: '',
      noticeStatus: false,
      stadiumId: '',
    };
  }

  componentDidShow() {
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.stadiumId + '').toString();
    this.getNoticeInfo(stadiumId);
    this.setState({
      stadiumId,
    });
  }

  getNoticeInfo(stadiumId) {
    requestData({
      method: 'GET',
      api: '/stadium/getNoticeInfo',
      params: {
        stadiumId,
      },
    }).then((res: any) => {
      const { noticeContent, noticeStatus } = res;
      this.setState({
        noticeContent,
        noticeStatus,
      });
    });
  }

  async handleChangeNoticeStatus(value) {
    this.setState({
      noticeStatus: value,
    });
  }

  async handleChangeNoticeContent(value) {
    await this.setState({
      noticeContent: value,
    });
  }

  async saveNotice() {
    const { noticeContent, noticeStatus, stadiumId } = this.state;
    if (!noticeContent) {
      await Taro.showToast({
        icon: 'none',
        title: '请输入公告内容',
      });
    }
    requestData({
      method: 'POST',
      api: '/stadium/modifyNotice',
      params: {
        noticeStatus,
        noticeContent,
        stadiumId,
      },
    }).then(async () => {
      await this.handleBack();
    });
  }

  async handleBack() {
    const eventChannel = Taro.getCurrentPages()[Taro.getCurrentPages().length - 1].getOpenerEventChannel();
    eventChannel.emit('noticeStatus', this.state.noticeStatus);
    await Taro.navigateBack({
      delta: -1,
    });
  }

  render() {
    const { noticeContent, noticeStatus } = this.state;

    return (
      <View className="stadium-notice-page">
        <AtSwitch
          title="是否开启弹窗公告"
          color="#00E36A"
          checked={noticeStatus}
          onChange={(value) => this.handleChangeNoticeStatus(value)}
        />

        <AtTextarea
          maxLength={100}
          height={200}
          placeholder="请输入公告内容"
          value={noticeContent}
          onChange={(value) => this.handleChangeNoticeContent(value)}
        />

        <View className="btn-list">
          <View className="btn" onClick={() => this.saveNotice()}>
            保存
          </View>
        </View>
      </View>
    );
  }
}

export default StadiumNoticePage;
