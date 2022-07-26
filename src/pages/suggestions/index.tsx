import React, { Component } from 'react';
import { Image, Swiper, SwiperItem, View } from '@tarojs/components';

import './index.scss';
import { AtCurtain, AtImagePicker, AtTextarea } from 'taro-ui';
import Taro from '@tarojs/taro';
import uploadData from '@/utils/uploadData';

interface IState {
  files: any[];
  previewImage: boolean;
  previewIndex: number;
  remark: string;
}

class Suggestions extends Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      previewImage: false,
      previewIndex: 0,
      remark: '',
    };
  }

  componentDidShow() {}

  handleRemarkChange(value) {
    this.setState({
      remark: value,
    });
  }

  async handleFileChange(val) {
    const fileList = val?.length > 5 ? val.slice(0, 5) : val;
    const filter = fileList.filter((f) => !f?.file?.size || f?.file?.size < 4194304);

    if (fileList.length !== filter.length) {
      await Taro.showToast({
        icon: 'none',
        title: '图片大小超过5M，请重新选择图片',
      });
    }

    this.setState({
      files: filter,
    });
  }

  onImageClick(flag, index) {
    this.setState({
      previewImage: flag,
      previewIndex: index,
    });
  }

  async handleUploadFiles() {
    const { files } = this.state;
    let flag = true;
    const fileList: any = [];
    const uploadFiles = files.filter((d) => !d.fileId);
    await Promise.all(
      uploadFiles.map(async (item, index) => {
        await uploadData({
          filePath: item.file.path,
          name: 'files',
        })
          .then((res: any) => {
            fileList.push(res);
          })
          .catch(async () => {
            flag = false;
            await Taro.showToast({
              icon: 'none',
              title: `第${index + 1}图片上传失败，请重新上传!`,
            });
          });
      })
    );
    return {
      flag,
      fileList,
    };
  }

  async submit() {
    const { remark, files } = this.state;
    let updateResult: any = {};

    if (files?.length) {
      updateResult = await this.handleUploadFiles();
      if (!updateResult?.flag) {
        return;
      }
    }

    const fileList = updateResult.fileList.map((d) => {
      const { fileId, path } = d;
      return {
        fileId,
        path,
      };
    });

    console.log(remark, fileList);
  }

  render() {
    const { files, previewIndex, previewImage, remark } = this.state;

    return (
      <View className="suggestions-page">
        <View className="list">
          <View className="upload">
            <View>内容描述</View>
            <AtTextarea
              maxLength={200}
              height={300}
              placeholderClass="remark-input"
              placeholder="请输入场馆说明"
              value={remark}
              onChange={(value) => this.handleRemarkChange(value)}
            />
          </View>
          <View className="upload">
            <View className="title">上传图片(最多三张)</View>
            <AtImagePicker
              multiple
              count={3}
              length={3}
              showAddBtn={files.length < 3}
              files={files}
              onChange={(files) => this.handleFileChange(files)}
              onFail={() => {}}
              onImageClick={(index) => this.onImageClick(true, index)}
            />
          </View>
        </View>

        <AtCurtain
          isOpened={previewImage}
          closeBtnPosition="top-right"
          onClose={() => {
            this.onImageClick(false, previewIndex);
          }}
        >
          <Swiper
            indicatorColor="#999"
            indicatorActiveColor="#0080ff"
            circular
            indicatorDots
            autoplay
            current={previewIndex}
            className="swiper-wrapper"
          >
            {files.map((item) => {
              return (
                <SwiperItem className="swiper-wrapper">
                  <Image src={item.url} mode="aspectFit" className="img"></Image>
                </SwiperItem>
              );
            })}
          </Swiper>
        </AtCurtain>

        <View className="btn" onClick={() => this.submit()}>
          提交
        </View>
      </View>
    );
  }
}

export default Suggestions;
