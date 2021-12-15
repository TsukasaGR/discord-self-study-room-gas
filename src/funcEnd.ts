/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 終了時処理
 */
const funcEnd = (type: DiscordFuncType, user: DiscordUser, at?: string) => {
  if (type !== 'end' && type !== 'endAndReport') {
    const content: DiscordMessageContent = {
      type,
      status: 'error',
      user,
      errorType: 'invalidType',
    };
    return postResultToDiscord(content);
  }
  if (!at) {
    const content: DiscordMessageContent = {
      type,
      status: 'error',
      user,
      errorType: 'invalidAt',
    };
    return postResultToDiscord(content);
  }
  if (!DB_SHEET) {
    const content: DiscordMessageContent = {
      type,
      status: 'error',
      user,
      errorType: 'invalidSS',
    };
    return postResultToDiscord(content);
  }

  // 更新可能な状態かチェック
  if (!validateStudyEnd(user.userId)) {
    const content: DiscordMessageContent = {
      type,
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

  // レポート報告も行う場合はレベルの計算を行う
  const date = new Date();
  let achievedLevel = 0;
  if (type === 'endAndReport') {
    // 現在時刻から日付を取得し、作業時間を算出する
    const updateAchieveLevelResponse = updateAchieveLevel(user, date);
    notionUpdateResult = updateAchieveLevelResponse.notionUpdateResult;
    achievedLevel = updateAchieveLevelResponse.achievedLevel;
  }

  // 正常終了
  const content: DiscordMessageContent = {
    type,
    status: 'ok',
    user,
    notionUpdateResult,
    studyMinutes: getStudyMinutes(rowNumber),
    totalStudyMinutes: getTotalStudyMinutes(user.userId, date),
    achievedLevel,
  };
  return postResultToDiscord(content);
};
