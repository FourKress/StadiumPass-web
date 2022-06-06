import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';
import { AtSwitch, AtTextarea } from 'taro-ui';

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
    this.setState({
      stadiumId,
    });
  }

  async handleChangeNoticeStatus(value) {
    this.setState({
      noticeStatus: value,
    });
    if (!value) {
      await this.handleCloseNotice();
    }
  }

  async handleCloseNotice() {
    await Taro.showModal({
      title: '提示',
      content: '确定要关闭弹窗公告吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setState({
            noticeStatus: false,
          });
        } else {
          this.setState({
            noticeStatus: true,
          });
        }
      },
    });
  }

  async handleChangeNoticeContent(value) {
    await this.setState({
      noticeContent: value,
    });
  }

  async saveNotice() {
    console.log(this.state.noticeContent);
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
