/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 開始時処理
 */
const funcStart = (user: DiscordUser, at?: string) => {
  if (!at) {
    const content: DiscordMessageContent = {
      type: 'start',
      status: 'error',
      user,
      errorType: 'invalidAt',
    };
    return postResultToDiscord(content);
  }
  if (!DB_SHEET) {
    const content: DiscordMessageContent = {
      type: 'start',
      status: 'error',
      user,
      errorType: 'invalidSS',
    };
    return postResultToDiscord(content);
  }

  // 登録可能な状態かチェック
  if (!validateStudyStart(user.userId)) {
    const content: DiscordMessageContent = {
      type: 'start',
      status: 'error',
      user,
      errorType: 'invalidStudyStart',
    };
    return postResultToDiscord(content);
  }

  // 新規レコードを追加
  DB_SHEET.appendRow([at, null, user.userId, user.userName]);

  // 正常終了
  const content: DiscordMessageContent = {
    type: 'start',
    status: 'ok',
    user,
  };
  return postResultToDiscord(content);
};
