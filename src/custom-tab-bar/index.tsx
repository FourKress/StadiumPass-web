import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';
import config from '@/src/app.config';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';
import * as LoginService from '@/services/loginService';

interface InjectStoreProps {
  tabBarStore: TabBarStore;
}

@inject('tabBarStore')
@observer
class CustomTabBar extends Component<InjectStoreProps, {}> {
  constructor(props) {
    super(props);
  }

  get inject() {
    // 兼容注入store 类型
    return this.props as InjectStoreProps;
  }

  async onLoad() {
    console.log('刷新tabBar');
    const token = Taro.getStorageSync('token');
    const isBoss = Taro.getStorageSync('auth') === 'boss';
    if (token && isBoss) {
      const openId = Taro.getStorageSync('openId');
      const res: any = await LoginService.sendLogin(openId);
      LoginService.saveUserInfo(res);
      const { authIds, userInfo } = res;
      if (!userInfo?.bossId && !authIds?.length) {
        Taro.setStorageSync('auth', 'client');
        // @ts-ignore
        const path = Taro.getCurrentInstance().router?.path;
        if (path === '/pages/load/index') {
          setTimeout(() => {
            this.jump();
          }, 800);
        } else {
          await this.jump();
        }
      }
    }
  }

  async jump() {
    await Taro.reLaunch({
      url: '/client/pages/waitStart/index',
    });
    await Taro.showToast({
      icon: 'none',
      title: '对不起，您不是管理员！',
    });
  }

  async switchTab(item, index) {
    const { pagePath } = item;
    if (pagePath.includes('community')) {
      await Taro.showToast({
        icon: 'none',
        title: '敬请期待',
      });
      return;
    }
    const {
      tabBarStore: { selected },
    } = this.inject;
    if (selected === index) return;
    await Taro.reLaunch({
      url: `/${pagePath}`,
    });
  }

  isWaitPath(path) {
    return path === 'client/pages/waitStart/index';
  }

  render() {
    const {
      tabBarStore: { selected },
    } = this.inject;
    const tabBar: any = config?.tabBar || {};
    const isBoss = Taro.getStorageSync('auth') === 'boss';

    const filterKeys: string[] = isBoss ? ['revenue', 'match'] : ['community', 'waitStart'];
    const tabBarList = tabBar.list
      .filter((d) => filterKeys.some((key) => d.pagePath.includes(key)) || d.pagePath.includes('userCenter'))
      .map((d, i) => {
        if (i === 2) {
          if (isBoss) {
            d.iconPath = require('../assets/icons/bar-5.png');
            d.selectedIconPath = require('../assets/icons/bar-6.png');
          } else {
            d.iconPath = require('../assets/icons/bar-10.png');
            d.selectedIconPath = require('../assets/icons/bar-11.png');
          }
        }
        return d;
      });

    return (
      <View className="bottom-tab">
        {tabBarList.map((item, index) => {
          return (
            <View
              className={`${
                !isBoss && this.isWaitPath(item.pagePath) ? 'bottom-tab-item wait-tab' : 'bottom-tab-item'
              }`}
              onClick={() => this.switchTab(item, index)}
              data-path={item.pagePath}
              key={item.text}
            >
              {index !== 2 ? (
                <Image
                  className="bottom-tab-item-img"
                  src={`../${selected === index ? item.selectedIconPath : item.iconPath}`}
                />
              ) : (
                <Image
                  className="bottom-tab-item-img"
                  src={selected === index ? item.selectedIconPath : item.iconPath}
                />
              )}
              <View
                className="bottom-tab-item-text"
                style={{
                  color: selected === index ? tabBar.selectedColor : tabBar.color,
                }}
              >
                {item.text}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
}

export default CustomTabBar;
