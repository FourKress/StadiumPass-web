import Taro from '@tarojs/taro';

const updateManager = Taro.getUpdateManager();

export const checkForUpdate = () => {
  //自动更新的设置
  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log(res.hasUpdate, '无版本更新');
  });
};

export const updateReady = () => {
  updateManager.onUpdateReady(async function () {
    await Taro.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        }
      },
    });
  });
  updateManager.onUpdateFailed(async function () {
    // 新的版本下载失败
    await Taro.showModal({
      title: '更新提示',
      content: '新版本下载失败',
      showCancel: false,
    });
  });
};
