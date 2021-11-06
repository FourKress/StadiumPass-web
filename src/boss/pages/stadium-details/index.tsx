import React, { Component } from 'react';
import { Picker, Text, View, CoverView, Swiper, SwiperItem, Image } from '@tarojs/components';
import {
  AtForm,
  AtInput,
  AtTextarea,
  AtTabBar,
  AtSwitch,
  AtIcon,
  AtList,
  AtListItem,
  AtImagePicker,
  AtCurtain,
} from 'taro-ui';
import Taro from '@tarojs/taro';

import './index.scss';
import requestData from '@/utils/requestData';
import uploadData from '@/utils/uploadData';
import { SERVER_PROTOCOL, SERVER_DOMAIN } from '@/src/config';
import * as LocalService from '@/services/localService';

interface IState {
  matchList: Array<any>;
  current: number;
  stadiumId: string;
  stadiumInfo: any;
  spaceIndex: number;
  spaceInfo: any;
  spaceList: Array<any>;
  showSpaceDetails: boolean;
  unitList: Array<any>;
  meHeaderPosition: any;
  latitude: string;
  longitude: string;
  files: any[];
  previewImage: boolean;
  previewIndex: number;
  authFail: boolean;
}

class StadiumDetailsPage extends Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      matchList: [],
      stadiumInfo: {},
      spaceList: [],
      spaceInfo: {},
      spaceIndex: 0,
      showSpaceDetails: false,
      stadiumId: '',
      unitList: [],
      meHeaderPosition: {},
      latitude: '',
      longitude: '',
      files: [],
      previewImage: false,
      previewIndex: 0,
      authFail: true,
    };
  }

  componentDidShow() {
    this.setMeBtnPosition();
    // @ts-ignore
    const pageParams = Taro.getCurrentInstance().router.params;
    const stadiumId = (pageParams.id + '').toString();
    this.setState(
      {
        stadiumId,
      },
      () => {
        this.matchInit();
      }
    );
  }

  setMeBtnPosition() {
    let stateHeight = 0; //  接收状态栏高度
    Taro.getSystemInfo({
      success(res) {
        stateHeight = res.statusBarHeight;
      },
    });

    this.setState({
      meHeaderPosition: {
        top: stateHeight,
      },
    });
  }

  matchInit() {
    this.getMatchList();
    this.getSpaceList();
  }

  async stadiumInit() {
    await this.getUnitList();
    this.getStadiumInfo();
    this.getSpaceList();
  }

  async getUnitList() {
    await requestData({
      method: 'GET',
      api: '/space/unitEnum',
    }).then((res: any) => {
      this.setState({
        unitList: res,
      });
    });
  }

  getMatchList() {
    requestData({
      method: 'GET',
      api: '/match/list',
      params: {
        stadiumId: this.state.stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        matchList: res,
      });
    });
  }

  getStadiumInfo() {
    requestData({
      method: 'GET',
      api: '/stadium/info',
      params: {
        id: this.state.stadiumId,
      },
    }).then((res: any) => {
      console.log(
        res.stadiumUrls.map((d) => {
          const { path, fileId } = d;
          return {
            path: `${SERVER_PROTOCOL}${SERVER_DOMAIN}${path}`,
            fileId,
          };
        })
      );
      this.setState({
        stadiumInfo: res,
        files: res.stadiumUrls.map((d) => {
          const { path, fileId } = d;
          return {
            url: `${SERVER_PROTOCOL}${SERVER_DOMAIN}${path}`,
            path,
            fileId,
          };
        }),
      });
    });
  }

  getSpaceList() {
    requestData({
      method: 'GET',
      api: '/space/dropDownList',
      params: {
        stadiumId: this.state.stadiumId,
      },
    }).then((res: any) => {
      this.setState({
        spaceList: res,
      });
    });
  }

  async handleTabClick(index) {
    this.setState({
      current: index,
    });
    if (index === 0) {
      this.matchInit();
    } else {
      Taro.getSetting().then(async (res) => {
        const userLocation = res?.authSetting['scope.userLocation'];
        if (!userLocation) {
          await LocalService.authorizeLocal(this);
        }
      });
      await this.stadiumInit();
    }
  }

  jumpDetails(item) {
    const { stadiumId, spaceList } = this.state;
    if (!spaceList?.length) {
      Taro.showToast({
        icon: 'none',
        title: '请先在场馆设置中添加场地',
      });
      return;
    }
    Taro.navigateTo({
      url: `/boss/pages/match-edit/index?stadiumId=${stadiumId}&matchId=${item?.id || ''}`,
    });
  }

  jumpFailStadium() {
    const { stadiumId } = this.state;
    Taro.navigateTo({
      url: `/boss/pages/fail-stadium/index?stadiumId=${stadiumId}`,
    });
  }

  handleChange(value, key) {
    const stadiumInfo = this.state.stadiumInfo;
    stadiumInfo[key] = value;
    this.setState({
      stadiumInfo: {
        ...stadiumInfo,
      },
    });
  }

  addSpace(spaceInfo, spaceIndex) {
    this.setState({
      spaceIndex,
      showSpaceDetails: true,
      spaceInfo,
    });
  }

  handleSpaceEdit(space, index) {
    this.addSpace(space, index);
  }

  handleSpaceChange(value, key) {
    const spaceInfo = this.state.spaceInfo;
    spaceInfo[key] = value;
    this.setState({
      spaceInfo: {
        ...spaceInfo,
      },
    });
  }

  handleSelectChange(event) {
    const index = event.detail.value;
    const value = this.state.unitList[index].value;
    this.handleSpaceChange(value, 'unit');
  }

  async saveStadium() {
    const { stadiumInfo, spaceList, files } = this.state;
    if (!files?.length) {
      await Taro.showToast({
        icon: 'none',
        title: '请至少上传一张图片！',
      });
      return;
    }
    stadiumInfo.spaces = spaceList;
    stadiumInfo.monthlyCardPrice = Number(stadiumInfo.monthlyCardPrice);
    const url = stadiumInfo?.id ? '/stadium/modify' : '/stadium/add';
    const updateResult = await this.uploadFiles();
    if (!updateResult?.flag) {
      return;
    }
    const fileList = files
      .filter((f) => f.fileId)
      .concat(updateResult.fileList)
      .map((d) => {
        const { fileId, path } = d;
        return {
          fileId,
          path,
        };
      });
    requestData({
      method: 'POST',
      api: url,
      params: {
        ...stadiumInfo,
        stadiumUrls: fileList,
      },
    }).then(async () => {
      Taro.showToast({
        icon: 'none',
        title: '场馆保存成功',
      }).then(async () => {
        await Taro.navigateBack({
          delta: -1,
        });
      });
    });
  }

  async uploadFiles() {
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

  async saveSpace() {
    const { spaceInfo, spaceList, spaceIndex, stadiumInfo } = this.state;
    const { name, unit } = spaceInfo;
    if (!name || !unit) {
      await Taro.showToast({
        icon: 'none',
        title: '请完善场地信息',
      });
      return;
    }
    spaceInfo.stadiumId = stadiumInfo.id;
    const space = await this.handleAndOrModifySpace(spaceInfo);
    if (spaceIndex === spaceList.length) {
      spaceList.push(space);
    } else {
      spaceList[spaceIndex] = space;
    }
    this.handleSpaceChangeResult(spaceList);
  }

  async handleAndOrModifySpace(spaceInfo) {
    const { id } = spaceInfo;
    return await requestData({
      method: 'POST',
      api: `/space/${id ? 'modify' : 'add'}`,
      params: spaceInfo,
    });
  }

  handleSpaceChangeResult(spaceList) {
    this.setState({
      spaceList: [...spaceList],
      spaceInfo: {},
      showSpaceDetails: false,
    });
  }

  removeSpace() {
    const { spaceInfo, spaceList, spaceIndex } = this.state;
    if (spaceInfo?.id) {
      requestData({
        method: 'GET',
        api: '/space/remove',
        params: {
          id: spaceInfo.id,
        },
      }).then(async () => {
        await this.getSpaceList();
        this.handleSpaceChangeResult(this.state.spaceList);
      });
    } else {
      if (spaceIndex === spaceList.length) {
        this.handleSpaceChangeResult(spaceList);
      } else {
        spaceList.splice(spaceIndex, 1);
        this.handleSpaceChangeResult(spaceList);
      }
    }
  }

  goBack() {
    if (this.state.showSpaceDetails) {
      this.setState({
        showSpaceDetails: false,
      });
      return;
    }
    Taro.navigateBack({
      delta: -1,
    });
  }

  closeSpaceDetails() {
    this.setState({
      spaceInfo: {},
      showSpaceDetails: false,
    });
  }

  handleLocalMap() {
    const { longitude = undefined, latitude = undefined } = this.state.stadiumInfo;
    // @ts-ignore
    wx.chooseLocation({
      longitude,
      latitude,
    })
      .then(async (res) => {
        const { longitude: lng, latitude: lat } = res;
        if (longitude === lng && latitude === lat) return;

        const result = await Taro.request({
          url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
          data: {
            key: '075561bf69a838475b7ca778cf71e6d9',
            location: `${lng},${lat}`,
            extensions: 'all',
            roadlevel: 0,
          },
        });

        const localInfo = result?.data.status === '1' ? result.data.regeocode : {};
        const {
          formatted_address: address,
          addressComponent: { city, province, district },
        } = localInfo;

        const stadiumInfo = this.state.stadiumInfo;
        this.setState({
          stadiumInfo: {
            ...stadiumInfo,
            address,
            city: city && city?.length ? city : '',
            province,
            district,
            longitude: lng,
            latitude: lat,
          },
        });
      })
      .catch(async (err) => {
        if (err?.errMsg === 'chooseLocation:fail auth deny') {
          await LocalService.authorizeLocal(this, () => {
            Taro.showToast({
              icon: 'none',
              title: '请重新选择场馆详细地址',
            });
          });
        }
      });
  }

  fileChange(val) {
    const files = val?.length > 5 ? val.slice(0, 5) : val;
    this.setState({
      files,
    });
  }

  onImageClick(flag, index) {
    this.setState({
      previewImage: flag,
      previewIndex: index,
    });
  }

  render() {
    const {
      current,
      stadiumInfo,
      spaceList,
      spaceInfo,
      showSpaceDetails,
      unitList,
      matchList,
      meHeaderPosition,
      files,
      previewImage,
      previewIndex,
    } = this.state;

    return (
      <View className="stadium-details-page">
        <View className="page-header" style={`padding-top: ${meHeaderPosition.top}px`}>
          <View className="header-panel">
            <AtIcon
              className="back-icon"
              value="chevron-left"
              size="24"
              color="#000"
              onClick={() => this.goBack()}
            ></AtIcon>
            <View className="page-title">
              <Text>球场详情</Text>
            </View>
          </View>
        </View>
        <AtTabBar
          tabList={[{ title: '场次设置' }, { title: '场馆设置' }]}
          onClick={(index) => this.handleTabClick(index)}
          current={current}
        />
        {current === 0 && !showSpaceDetails && (
          <View>
            {matchList.length > 0 ? (
              <View
                className="list"
                style={`height: calc(100vh - ${140 + meHeaderPosition.top}px - env(safe-area-inset-bottom))`}
              >
                <View className="scroll-warp">
                  {matchList.map((item) => {
                    return (
                      <View className="item" onClick={() => this.jumpDetails(item)}>
                        <View className="top">
                          <View className="left">{item.repeatModel === 1 ? '单次场次' : '重复场次'}</View>
                          <View className="right">
                            <View className="money">
                              <Text>￥{item.rebatePrice}</Text>
                              <Text className="discount">{item.rebate}折</Text>
                              <Text>/人</Text>
                            </View>
                          </View>
                        </View>
                        <View className="item-body">
                          <View>场地：{item.space?.name}</View>
                          <View>
                            时间：{item.repeatName} / {item.startAt}-{item.endAt}
                          </View>
                          <View>时长：{item.duration}小时</View>
                          <View>
                            人数：最少{item.minPeople}人 / 最多{item.totalPeople}人
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="not-data" style="margin-top: 32px">
                暂无数据
              </View>
            )}
          </View>
        )}
        {current === 1 && !showSpaceDetails && (
          <View
            className="list stadium"
            style={`height: calc(100vh - ${140 + meHeaderPosition.top}px - env(safe-area-inset-bottom))`}
          >
            <View className="scroll-warp">
              <AtForm className="form">
                <View className="title">
                  <View className="name">场地设置</View>
                </View>
                {spaceList.length > 0 &&
                  spaceList.map((item, index) => {
                    return (
                      <View className="space-row" onClick={() => this.handleSpaceEdit(item, index)}>
                        <AtInput
                          name="duration"
                          title={item.name}
                          type="text"
                          editable={false}
                          value={unitList.find((d) => d.value === item.unit)?.label}
                          onChange={() => {}}
                        />
                        <AtIcon value="chevron-right" size="18" color="#000"></AtIcon>
                      </View>
                    );
                  })}
                <View className="add" onClick={() => this.addSpace({}, spaceList.length)}>
                  <AtIcon value="add" size="14" color="#0080FF"></AtIcon>
                  <View>新增场地</View>
                </View>

                <View className="title">
                  <View className="name">月卡设置</View>
                </View>
                <AtSwitch
                  title="支持月卡"
                  color="#00E36A"
                  checked={stadiumInfo.monthlyCardStatus}
                  onChange={(value) => this.handleChange(value, 'monthlyCardStatus')}
                />
                <AtInput
                  name="monthlyCardPrice"
                  title="购买金额"
                  type="text"
                  placeholder="请输入月卡购买金额"
                  value={stadiumInfo.monthlyCardPrice}
                  onChange={(value) => this.handleChange(value, 'monthlyCardPrice')}
                />
                <View className="title">
                  <View className="name">场馆介绍</View>
                </View>
                <AtInput
                  name="name"
                  title="场馆名称"
                  type="text"
                  placeholder="请输入场馆名称"
                  value={stadiumInfo.name}
                  onChange={(value) => this.handleChange(value, 'name')}
                />
                <AtInput
                  name="rebatePrice"
                  title="详细地址"
                  type="text"
                  placeholder="请选择详细地址"
                  value={stadiumInfo.address}
                  disabled
                  editable={false}
                  onChange={() => {}}
                  onClick={() => this.handleLocalMap()}
                />
                <AtInput
                  name="phoneNum"
                  title="联系电话"
                  type="text"
                  placeholder="请输入联系电话"
                  value={stadiumInfo.phoneNum}
                  onChange={(value) => this.handleChange(value, 'phoneNum')}
                />

                <View>
                  <View className="row-title">
                    <View>上传图片(最多5张)</View>
                  </View>
                </View>

                <View>
                  <AtImagePicker
                    multiple
                    count={5}
                    length={5}
                    showAddBtn={files.length < 5}
                    files={files}
                    onChange={(files) => this.fileChange(files)}
                    onFail={() => {}}
                    onImageClick={(index) => this.onImageClick(true, index)}
                  />
                </View>
                <View className="row-title">
                  <View>场馆说明</View>
                </View>
                <AtTextarea
                  maxLength={200}
                  placeholder="请输入场馆说明"
                  value={stadiumInfo.description}
                  onChange={(value) => this.handleChange(value, 'description')}
                />
              </AtForm>
            </View>
          </View>
        )}

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

        {current === 0 && (
          <View className="btn-list">
            <View className="btn" onClick={() => this.jumpFailStadium()}>
              已失效场次
            </View>
            <View className="btn" onClick={() => this.jumpDetails({})}>
              新建场次
            </View>
          </View>
        )}
        {current === 1 && (
          <View className="btn-list">
            <View className="save btn" onClick={() => this.saveStadium()}>
              保存
            </View>
          </View>
        )}

        {showSpaceDetails && (
          <CoverView>
            <View className="space-details" style={`padding-top: ${meHeaderPosition.top + 45}px`}>
              <View className="cancel-icon" style={`top: ${meHeaderPosition.top + 8}px`}>
                <AtIcon value="chevron-left" size="24" color="#000" onClick={() => this.closeSpaceDetails()}></AtIcon>
              </View>

              <AtForm className="form">
                <AtInput
                  style={`top: ${meHeaderPosition.top + 45}px`}
                  name="spaceName"
                  title="场地名称"
                  type="text"
                  placeholder="请输入场地名称"
                  value={spaceInfo.name}
                  onChange={(value) => this.handleSpaceChange(value, 'name')}
                />
                <Picker
                  mode="selector"
                  range={unitList}
                  rangeKey="label"
                  onChange={(event) => this.handleSelectChange(event)}
                >
                  <AtList>
                    <AtListItem
                      title="对局规格"
                      arrow="down"
                      extraText={unitList.find((d) => d.value === spaceInfo.unit)?.label}
                    />
                  </AtList>
                </Picker>
              </AtForm>
              <View className="btn-list">
                {(spaceInfo.name || spaceInfo.unit) && (
                  <View className="btn space-btn" onClick={() => this.removeSpace()}>
                    删除场地
                  </View>
                )}
                <View className="btn space-btn" onClick={() => this.saveSpace()}>
                  保存场地
                </View>
              </View>
            </View>
          </CoverView>
        )}
      </View>
    );
  }
}

export default StadiumDetailsPage;