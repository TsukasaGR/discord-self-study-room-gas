/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 終了時処理
 */
const funcEnd = (user: DiscordUser, at?: string) => {
  if (!at) {
    const content: DiscordMessageContent = {
      type: 'end',
      status: 'error',
      user,
      errorType: 'invalidAt',
    };
    return postResultToDiscord(content);
  }
  if (!DB_SHEET) {
    const content: DiscordMessageContent = {
      type: 'end',
      status: 'error',
      user,
      errorType: 'invalidSS',
    };
    return postResultToDiscord(content);
  }

  // 更新可能な状態かチェック
  if (!validateStudyEnd(user.userId)) {
    const content: DiscordMessageContent = {
      type: 'end',
      status: 'error',
      user,
      errorType: 'invalidStudyEnd',
    };
    return postResultToDiscord(content);
  }

  // 終了時刻を更新
  const rowNumber = getEndAtUpdateRecordRowNumber(user.userId);
  DB_SHEET.getRange(rowNumber, 2).setValue(at);

  // 当日の達成クエストがまだ登録されていないようであれば登録する
  const notionId = getUserNotionId(user);
  let notionUpdateResult: NotionUpdatedResult = 'skip';
  const formattedDate = getFormatDate(new Date(at));
  if (notionId && !existDailyAchieved(user, formattedDate)) {
    if (addAchievedQuestDaily(notionId, formattedDate)) {
      notionUpdateResult = 'ok';
      setDailyAchieved(user, formattedDate);
    } else {
      notionUpdateResult = 'ng';
    }
  }

  // 正常終了
  const content: DiscordMessageContent = {
    type: 'end',
    status: 'ok',
    user,
    notionUpdateResult,
    studyMinutes: getStudyMinutes(rowNumber),
  };
  return postResultToDiscord(content);
};
