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

  // 現在の合計作業時間を取得
  const currentTotalMinutes = getTotalStudyMinutes(user.userId, null);
  const currentTotalHours = parseInt(String(currentTotalMinutes / 60));
  // 現在の報酬レベルを取得
  const currentRewardLevel = getCurrentRewardLevel(user.userId);
  // 報酬リストを取得
  const rewardItems = getRewardItems();
  // クリアしたレベル
  let achievedLevel = 0;
  // 現在の作業時間合計が上のレベルに達しているか確認
  for (let i = rewardItems.length - 1; i >= 0; i--) {
    if (
      currentRewardLevel < rewardItems[i].level &&
      currentTotalHours >= rewardItems[i].hours
    ) {
      achievedLevel = rewardItems[i].level;
      break;
    }
  }

  // 現在の報酬レベルをアップ
  let notionUpdateResult: NotionUpdatedResult = 'skip';
  if (achievedLevel) {
    setCurrentRewardLevel(user.userId, achievedLevel);
    const formattedDate = getFormatDate(date);
    const notionId = getUserNotionId(user);
    // Notion IDがセットされている場合は達成クエストを追加
    if (notionId) {
      if (addAchievedQuestLevelUp(notionId, formattedDate, achievedLevel)) {
        notionUpdateResult = 'ok';
      } else {
        notionUpdateResult = 'ng';
      }
    }
  }

  // 正常終了
  const content: DiscordMessageContent = {
    type: 'report',
    status: 'ok',
    user,
    notionUpdateResult,
    studyMinutes: getTotalStudyMinutes(user.userId, date),
    achievedLevel: achievedLevel,
  };
  return postResultToDiscord(content);
};
