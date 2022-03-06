import Taro from '@tarojs/taro';

const handleAuthorizeLocal = async (status, cb) => {
  if (!status) {
    await Taro.showToast({
      title: '获取位置信息授权失败，请重新授权。',
      icon: 'none',
    });
    return;
  }
  await cb();
};

const handleAuthStatus = (ctx, status) => {
  ctx.setState({
    authFail: status,
  });
};

const authorizeLocal = (ctx, cb = () => {}) => {
  Taro.authorize({
    scope: 'scope.userLocation',
  })
    .then(async () => {
      await handleAuthorizeLocal(true, cb);
    })
    .catch(async ({ errMsg }) => {
      console.log(errMsg);
      if (errMsg.includes('authorize:fail') && ctx.state.authFail) {
        await Taro.showModal({
          title: '授权提示',
          content: '授权获取位置信息，查看您附近的场馆',
          confirmText: '去设置',
          success: async (res) => {
            if (res.confirm) {
              await Taro.openSetting({
                success: async (res) => {
                  const userLocation = res.authSetting['scope.userLocation'];
                  if (!userLocation) {
                    await handleAuthorizeLocal(false, cb);
                    return;
                  }
                  handleAuthStatus(ctx, false);
                  await handleAuthorizeLocal(!!userLocation, cb);
                },
              });
            } else {
              await handleAuthorizeLocal(false, cb);
            }
          },
        });
        return;
      }
      handleAuthStatus(ctx, true);
      await handleAuthorizeLocal(false, cb);
    });
};

export { authorizeLocal, handleAuthorizeLocal };
