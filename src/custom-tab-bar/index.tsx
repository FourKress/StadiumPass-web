import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { CoverView, CoverImage } from '@tarojs/components';
import './index.scss';

class CustomTabBar extends Component {
  state = {
    selected: 0,
    color: 'rgba(68, 68, 68, 1)',
    selectedColor: 'rgba(68, 68, 68, 1)',
    list: [
      {
        pagePath: '/pages/revenue/index',
        text: '营收',
        iconPath: '',
        selectedIconPath: '',
      },
      {
        pagePath: '/pages/index/index',
        text: '场次',
        iconPath: '',
        selectedIconPath: '',
      },
      {
        pagePath: '/pages/me/index',
        text: '我的',
        iconPath: '',
        selectedIconPath: '',
      },
    ],
  };

  switchTab = (item) => {
    Taro.switchTab({
      url: item.pagePath,
    });
  };

  render() {
    const isBoss = Taro.getStorageSync('userInfo').isBoss || true;
    console.log(isBoss);
    if (!isBoss) {
      return '';
    }
    return (
      <CoverView className="bottom-tab">
        {this.state.list.map((item, index) => {
          return (
            <CoverView
              className="bottom-tab-item"
              onClick={this.switchTab.bind(this, item)}
              data-path={item.pagePath}
              key={item.text}
            >
              <CoverImage
                className="bottom-tab-item-img"
                src={
                  this.state.selected === index
                    ? item.selectedIconPath
                    : item.iconPath
                }
              />
              <CoverView
                className="bottom-tab-item-text"
                style={{
                  color:
                    this.state.selected === index
                      ? this.state.selectedColor
                      : this.state.color,
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
