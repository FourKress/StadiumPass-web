import Taro from '@tarojs/taro';
import requestData from '@/utils/requestData';

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
  const { stadium, space, runDate, startAt, endAt, id, selectPeople, minPeople, totalPeople, isDone, isCancel } =
    matchInfo;
  const count = selectPeople >= minPeople ? totalPeople : minPeople;
  let imageData = '';

  const memberList: any = await getMemberList(id);
  const userList = Array(count)
    .fill({})
    .map((d, i) => {
      const target = memberList[i];
      if (target) {
        const { avatarUrl, nickName } = target;
        return {
          avatarUrl,
          nickName,
          isDone,
          isCancel,
        };
      }
      return {
        ...d,
        isDone,
        isCancel,
      };
    });

  await Taro.request({
    url: `http://150.158.22.228:4927/registry/generate?userList=${JSON.stringify(userList)}`,
    method: 'GET',
    success: (res) => {
      imageData = res.data;
    },
  });

  const fs = Taro.getFileSystemManager();
  const imageUrl = `${Taro.env.USER_DATA_PATH}/${Date.now()}.jpg`;
  fs.writeFileSync(imageUrl, imageData, 'base64');

  const shareObj = {
    title: `${stadium.name}/${space.name}/${runDate.substring(5, 10)} ${startAt}-${endAt}`,
    path: `/client/pages/stadium/index?stadiumId=${stadium.id}&runDate=${runDate}&spaceId=${space.id}&matchId=${id}`,
    imageUrl,
  };
  return shareObj;
};

export { handleShare, setShareMenu };
