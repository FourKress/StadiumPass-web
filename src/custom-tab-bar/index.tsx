import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
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

  async switchTab(item, index) {
    const { pagePath } = item;
    if (pagePath.includes('community')) {
      await Taro.showToast({
        icon: 'none',
        title: '敬请期待!',
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

  render() {
    const {
      tabBarStore: { selected },
    } = this.inject;
    const tabBar: any = config?.tabBar || {};
    const isBoss = Taro.getStorageSync('auth') === 'boss';

    const filterKeys: string[] = isBoss ? ['revenue', 'match'] : ['community', 'waitStart'];
    const tabBarList = tabBar.list.filter(
      (d) => filterKeys.some((key) => d.pagePath.includes(key)) || d.pagePath.includes('userCenter')
    );

    return (
      <View className="bottom-tab">
        {tabBarList.map((item, index) => {
          return (
            <View
              className="bottom-tab-item"
              onClick={() => this.switchTab(item, index)}
              data-path={item.pagePath}
              key={item.text}
            >
              <Image className="bottom-tab-item-img" src={selected === index ? item.selectedIconPath : item.iconPath} />
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
