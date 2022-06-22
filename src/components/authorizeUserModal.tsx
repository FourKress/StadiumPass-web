import React, { Component } from 'react';
import { Button, View } from '@tarojs/components';
import { AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui';

interface IProps {
  authorize: boolean;
  onChange?: (value) => void;
  upload?: boolean;
  onUpload?: (value) => void;
}

class AuthorizeUserBtn extends Component<IProps> {
  constructor(props) {
    super(props);
  }

  handleOnChange(status) {
    if (this.props.onChange) {
      this.props.onChange(status);
    }
  }

  handleOnUpload(status) {
    if (this.props.onUpload) {
      this.props.onUpload(status);
    }
  }

  render() {
    const { authorize, upload } = this.props;

    return (
      <AtModal isOpened={authorize}>
        <AtModalHeader>{upload ? '更新' : '登录'}提示</AtModalHeader>
        <AtModalContent>
          <View>
            <View className="row">
              {upload
                ? '更新需要微信授权，为了给您更好的体验，请授权获取用户信息。'
                : '当前是您第一次登录，为了给您更好的体验，请授权完善用户信息。'}
            </View>
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={() => this.handleOnChange(false)}>取消</Button>
          <Button onClick={() => (upload ? this.handleOnUpload(true) : this.handleOnChange(true))}>授权</Button>
        </AtModalAction>
      </AtModal>
    );
  }
}

export default AuthorizeUserBtn;
