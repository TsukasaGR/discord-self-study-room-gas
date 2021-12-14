/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * メイン処理
 */
const doPost = (e: PayloadFromDiscord) => {
  const json = e.postData.getDataAsString();
  const data: JsonPayloadFromDiscord = JSON.parse(json);
  const type = data.type;
  const at = data.at;
  const userId = data.userId;
  const userName = data.userName;
  const user: DiscordUser = { userId, userName };

  // 対象ユーザーが登録されていない場合登録を促すエラーを返す
  if (!existUserId(userId)) {
    const content: DiscordMessageContent = {
      type,
      user,
      status: 'error',
      errorType: 'UnregisteredUser',
    };
    return postResultToDiscord(content);
  }

  switch (type) {
    // 開始処理
    case 'start':
      return funcStart(user, at);
    // 終了処理
    case 'end':
      return funcEnd(user, at);
    case 'report':
      return funcReport(user);
  }
};
