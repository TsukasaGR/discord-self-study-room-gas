/* eslint-disable @typescript-eslint/no-unused-vars */
const funcReport = (user: DiscordUser) => {
  if (!DB_SHEET) {
    const content: DiscordMessageContent = {
      type: 'report',
      status: 'error',
      user,
      errorType: 'invalidSS',
    };
    return postResultToDiscord(content);
  }

    // 現在時刻から日付を取得し、作業時間を算出する
  const date = new Date();
  const updateAchieveLevelResponse = updateAchieveLevel(user, date);

  // 正常終了
  const content: DiscordMessageContent = {
    type: 'report',
    status: 'ok',
    user,
    notionUpdateResult: updateAchieveLevelResponse.notionUpdateResult,
    totalStudyMinutes: getTotalStudyMinutes(user.userId, date),
    achievedLevel: updateAchieveLevelResponse.achievedLevel,
  };
  return postResultToDiscord(content);
};
