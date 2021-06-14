import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtButton, AtForm, AtInput } from 'taro-ui';
import requestData from '@/utils/requestData';
import { validateRegular } from '../../utils/validateRule';

import './index.scss';

interface InjectState {
  loginId?: string;
  pwd?: string;
  loading?: boolean;
  text?: string;
  isSend?: boolean;
}

let timer = null;

class Login extends Component<{}, InjectState> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loginId: '',
      pwd: '',
      text: this.TEXT,
      isSend: false,
    };
  }

  private TEXT = '发送验证码';

  handleChange(value, key) {
    this.setState({
      [key]: value,
    });
  }

  handleCode() {
    if (this.state.isSend) return;
    const { loginId: phoneNum } = this.state;
    if (!validateRegular.phone.test(phoneNum || '')) {
      Taro.showToast({
        icon: 'none',
        title: '请输入正确的手机号码',
      });
      return;
    }
    this.setState({ isSend: true });
    Taro.showLoading({
      title: '发送中...',
    });
    requestData({
      method: 'GET',
      api: `/applet/order/msg`,
      params: {
        phoneNum,
      },
    })
      .then(() => {
        let num = 120;
        // @ts-ignore
        timer = setInterval(() => {
          num -= 1;
          if (num < 0) {
            // @ts-ignore
            clearInterval(timer);
            this.setState({
              text: this.TEXT,
              isSend: false,
            });
            return;
          }
          this.setState({
            text: `${num}S`,
          });
        }, 1000);
      })
      .catch(() => {
        this.setState({
          text: this.TEXT,
          isSend: false,
        });
        // @ts-ignore
        timer = {};
      });
  }

  /**登录 */
  handleLogin() {
    const { loginId, pwd } = this.state;
    if (!loginId) {
      Taro.showToast({
        icon: 'none',
        title: '请输入正确的手机号码',
      });
      return;
    }
    if (!pwd) {
      Taro.showToast({
        icon: 'none',
        title: '请输入正确的验证码',
      });
      return;
    }
    this.setState({
      loading: true,
    });
    requestData({
      method: 'POST',
      api: `/applet/order/login`,
      params: {
        loginId,
        pwd,
      },
    })
      .then(async (res: any) => {
        Taro.setStorageSync('token', res?.token);
        Taro.setStorageSync('userInfo', res?.contacts);
        await this.getOpenId();
        this.setState({
          loading: false,
        });
        Taro.navigateBack({
          delta: -1,
          success() {
            Taro.showToast({
              title: '登录成功',
            });
          },
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
        });
      });
  }

  getOpenId() {
    if (!Taro.getStorageSync('openid')) {
      // @ts-ignore
      wx.login({
        success: (res) => {
          console.log(res.code);
          requestData({
            method: 'GET',
            api: `/applet/order/code2Session`,
            params: {
              code: res.code,
            },
          }).then((r: any) => {
            console.log(r);
            Taro.setStorageSync('openid', r.openid);
          });
        },
      });
    }
  }

  render() {
    return (
      <View className="login">
        <View className="form-panel">
          <AtForm>
            <View className="input-row">
              <AtInput
                name="first"
                title=""
                type="number"
                placeholder="请输入注册手机号码"
                value={this.state.loginId}
                onChange={(value) => this.handleChange(value, 'loginId')}
              />
            </View>

            <View className="input-row">
              <View className="at-row">
                <View className="at-col at-col-8">
                  <AtInput
                    name="second"
                    title=""
                    type="number"
                    placeholder="请输入短信验证码"
                    value={this.state.pwd}
                    onChange={(value) => this.handleChange(value, 'pwd')}
                  />
                </View>
                <View className="at-col at-col-4">
                  <View className="code-btn">
                    <AtButton
                      className={this.state.isSend ? 'disabled' : ''}
                      type="secondary"
                      loading={this.state.loading}
                      onClick={() => this.handleCode()}
                    >
                      {this.state.text}
                    </AtButton>
                  </View>
                </View>
              </View>
            </View>

            <View className="btn">
              <AtButton
                type="primary"
                loading={this.state.loading}
                onClick={() => this.handleLogin()}
              >
                登录
              </AtButton>
            </View>
          </AtForm>
        </View>
      </View>
    );
  }
}

export default Login;
