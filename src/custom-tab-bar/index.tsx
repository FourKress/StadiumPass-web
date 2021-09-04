import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { CoverView, CoverImage } from '@tarojs/components';
import './index.scss';
import config from '@/src/app.config';

import { inject, observer } from 'mobx-react';
import TabBarStore from '@/store/tabbarStore';

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

  switchTab(item, index) {
    this.inject.tabBarStore.setSelected(index);
    Taro.switchTab({
      url: `/${item.pagePath}`,
    });
  }

  render() {
    const isBoss = Taro.getStorageSync('userInfo')?.bossId || true;
    if (!isBoss) {
      return '';
    }
    const {
      tabBarStore: { selected },
    } = this.inject;
    const tabBar: any = config?.tabBar || {};

    return (
      <CoverView className="bottom-tab">
        {tabBar.list.map((item, index) => {
          return (
            <CoverView
              className="bottom-tab-item"
              onClick={() => this.switchTab(item, index)}
              data-path={item.pagePath}
              key={item.text}
            >
              <CoverImage
                className="bottom-tab-item-img"
                src={selected === index ? item.selectedIconPath : item.iconPath}
              />
              <CoverView
                className="bottom-tab-item-text"
                style={{
                  color: selected === index ? tabBar.selectedColor : tabBar.color,
                }}
              >
                {item.text}
              </CoverView>
            </CoverView>
          );
        })}
      </CoverView>
    );
  }
}

export default CustomTabBar;
