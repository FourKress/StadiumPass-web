import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';
import { SERVER_PROTOCOL, SERVER_DOMAIN } from '@/src/config';
import dayjs from 'dayjs';

const setShareMenu = async () => {
  await Taro.showShareMenu({
    withShareTicket: true,
    // @ts-ignore
    menus: ['shareAppMessage', 'shareTimeline'],
  });
};

const getMemberList = async (matchId) => {
  return requestData({
    method: 'GET',
    api: '/userRMatch/findAllByMatchId',
    params: {
      matchId,
    },
  });
};

const handleShare = async (state) => {
  const { matchInfo } = state;
  const { stadium, space, runDate, startAt, endAt, selectPeople, minPeople, totalPeople, isDone, isCancel } = matchInfo;
  const count = selectPeople >= minPeople ? totalPeople : minPeople;
  let imageData = '';

  const memberList: any = await getMemberList(matchInfo.id);
  const userList = Array(count)
    .fill({})
    .map((d, i) => {
      const target = memberList[i];
      const index = i + 1;
      const data = {
        index,
        isDone,
        isCancel,
      };
      if (target) {
        const { avatarUrl, nickName, isMonthlyCardPay = false } = target;
        return {
          avatarUrl,
          nickName,
          isMonthlyCardPay,
          ...data,
        };
      }
      return {
        ...d,
        ...data,
        isMonthlyCardPay: false,
      };
    });

  await Taro.request({
    url: `${SERVER_PROTOCOL}${SERVER_DOMAIN}/shareImage/registry/generate`,
    data: userList,
    method: 'POST',
    success: (res) => {
      imageData = res.data;
    },
  });

  const fs = Taro.getFileSystemManager();
  const imageUrl = `${Taro.env.USER_DATA_PATH}/${Date.now()}.jpg`;
  fs.writeFileSync(imageUrl, imageData, 'base64');

  const isNowDay = dayjs().format('YYYY-MM-DD') === runDate;
  const weekMap = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
  };

  const shareObj = {
    title: `${isNowDay ? '今日' : runDate.substring(5, 10)}(${weekMap[dayjs(runDate).day()]}) / ${startAt}-${endAt} / ${
      space.name
    } / ${stadium.name}`,
    path: `/client/pages/stadium/index?stadiumId=${stadium.id}&runDate=${runDate}&spaceId=${space.id}&matchId=${matchInfo.id}`,
    imageUrl,
  };
  return shareObj;
};

export { handleShare, setShareMenu };
