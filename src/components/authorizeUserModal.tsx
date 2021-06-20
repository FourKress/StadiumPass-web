import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import { AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui';

interface IProps {
  authorize: boolean;
  onChange: (value) => void;
}

class AuthorizeUserBtn extends Component<IProps> {
  constructor(props) {
    super(props);
  }

  handleOnChange(status) {
    this.props.onChange(status);
  }

  render() {
    const { authorize } = this.props;

    return (
      <AtModal isOpened={authorize}>
        <AtModalHeader>登陆提示</AtModalHeader>
        <AtModalContent>
          <View>
            <View className="row">
              当前是您第一次登录，为了给你更好的体验，请授权完善用户信息。
            </View>
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={() => this.handleOnChange(false)}>取消</Button>
          <Button onClick={() => this.handleOnChange(true)}>授权</Button>
        </AtModalAction>
      </AtModal>
    );
  }
}

export default AuthorizeUserBtn;
