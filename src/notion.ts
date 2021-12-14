/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * NotionAPI実行
 * NotionAPIにはJS用のライブラリが存在するが、GASのライブラリに入っていなかったためUrlFetchAppでの実行としている
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postNotion = (properties: any) => {
  const url = 'https://api.notion.com/v1/pages';
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: 'Bearer ' + NOTION_TOKEN,
    'Notion-Version': '2021-05-13',
  };

  const postData = {
    parent: {
      database_id: QUEST_DB_ID,
    },
    properties,
  };

  try {
    const result = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(postData),
    });
    return result.getResponseCode() === 200;
  } catch (e) {
    // エラー確認したい場合は当該try/catchをコメントアウトし、Glitch上のコンソールで確認する
    console.log(e);
    return false;
  }
};

/**
 * デイリー作業時のNotionDB登録
 */
const addAchievedQuestDaily = (userNotionId: string, achievedDate: string) => {
  const properties = {
    名称: {
      title: [
        {
          text: {
            content: `自習_${achievedDate}`,
          },
        },
      ],
    },
    種別: {
      select: {
        id: '9984eacb-c165-45e9-a6c8-14b5c9341efd',
        name: '自習: 3',
        color: 'purple',
      },
    },
    達成者: {
      people: [
        {
          id: userNotionId,
        },
      ],
    },
    達成日: {
      type: 'date',
      date: {
        start: achievedDate,
        end: null,
        time_zone: null,
      },
    },
  };

  return postNotion(properties);
};

/**
 * 報酬レベルアップ時のNotionDB登録
 */
const addAchievedQuestLevelUp = (
  userNotionId: string,
  achievedDate: string,
  achievedLevel: number
) => {
  const rewardItems = getRewardItems();
  const achievedLevelItem = rewardItems.find(
    (item) => item.level === achievedLevel
  );
  const achievedLevelPoint = achievedLevelItem?.point;

  const properties = {
    名称: {
      title: [
        {
          text: {
            content: `自習Level${achievedLevel}達成->付与ポイント:${achievedLevelPoint}`,
          },
        },
      ],
    },
    種別: {
      select: {
        id: '9f97b38c-ef1f-4602-9142-67671a317594',
        name: '自習(一定時間クリア): 50~',
        color: 'pink',
      },
    },
    達成者: {
      people: [
        {
          id: userNotionId,
        },
      ],
    },
    達成日: {
      type: 'date',
      date: {
        start: achievedDate,
        end: null,
        time_zone: null,
      },
    },
  };

  return postNotion(properties);
};
