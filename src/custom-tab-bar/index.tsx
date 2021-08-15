import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { CoverView, CoverImage } from '@tarojs/components';
import './index.scss';

interface IState {
  selected: number;
  color: string;
  selectedColor: string;
  list: Array<any>;
}

class CustomTabBar extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      color: '#93A7B6',
      selectedColor: '#0080FF',
      list: [
        {
          pagePath: '/pages/revenue/index',
          text: '营收',
          iconPath: '',
          selectedIconPath: '',
        },
        {
          pagePath: '/pages/sequence/index',
          text: '场次',
          iconPath: '',
          selectedIconPath: '',
        },
        {
          pagePath: '/pages/bossMe/index',
          text: '我的',
          iconPath: '',
          selectedIconPath: '',
        },
      ],
    };
  }

  switchTab(item, index) {
    Taro.switchTab({
      url: item.pagePath,
    });
    this.setState({
      selected: index,
    });
  }

  render() {
    const isBoss = Taro.getStorageSync('userInfo').isBoss || true;
    console.log(isBoss, this.state.selected);
    if (!isBoss) {
      return '';
    }
    return (
      <CoverView className="bottom-tab">
        {this.state.list.map((item, index) => {
          return (
            <CoverView
              className="bottom-tab-item"
              onClick={() => this.switchTab(item, index)}
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
