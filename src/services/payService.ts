import requestData from '@/utils/requestData';
import Taro from '@tarojs/taro';

const changeOrderStatus = async (orderId, params) => {
  await requestData({
    method: 'POST',
    api: '/order/modify',
    params: {
      id: orderId,
      ...params,
    },
  });
};

const paySuccess = async (cb) => {
  Taro.hideLoading();
  await Taro.showToast({
    icon: 'none',
    title: '支付成功',
  });
  cb && cb();
};

const payService = async (params, cb) => {
  const { orderId, payMethod } = params;
  const orderFromDB: any = await requestData({
    method: 'POST',
    api: '/order/pay',
    params: {
      id: orderId,
      payMethod,
    },
  });
  if (!orderFromDB) {
    Taro.hideLoading();
    return;
  }
  const { payMethod: method, payAmount } = orderFromDB;
  if (method === 2 && payAmount === 0) {
    await changeOrderStatus(orderId, {
      status: 1,
      payAt: Date.now(),
    });
    requestData({
      method: 'POST',
      api: '/wx/wechatyBotNotice',
      params: {
        orderId,
        url: 'sendMiniProgram',
      },
    }).then(() => {});
    await paySuccess(cb);
    return;
  }
  const openId = Taro.getStorageSync('openId');
  const prePayInfo: any = await requestData({
    method: 'POST',
    api: '/wx/pay',
    params: {
      orderId,
      openId,
      payAmount: orderFromDB.payAmount,
    },
  });

  if (prePayInfo) {
    Taro.requestPayment({
      appId: 'wx8e63001d0409fa13',
      timeStamp: prePayInfo.timestamp,
      nonceStr: prePayInfo.nonceStr,
      package: prePayInfo.package,
      paySign: prePayInfo.paySign,
      // @ts-ignore
      signType: 'RSA',
    })
      .then(async () => {
        await paySuccess(cb);
      })
      .catch(async (e) => {
        console.log(e);
        Taro.hideLoading();
        await Taro.showToast({
          icon: 'none',
          title: '支付失败',
        });
        await changeOrderStatus(orderId, {
          status: 0,
        });
      });
  }
};

export default payService;
