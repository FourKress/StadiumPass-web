import React, { Component } from 'react';
import { View } from '@tarojs/components';
import './index.scss';

interface IState {}

class CommunityPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <View>圈子</View>;
  }
}

export default CommunityPage;
