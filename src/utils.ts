/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 投稿したユーザーがユーザーリストに存在するかを返す
 */
const existUserId = (userId: string): boolean => {
  if (!USER_SHEET) return false;
  const lastRow = USER_SHEET.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  if (!lastRow) return false;
  for (let i = 1; i <= lastRow; i++) {
    if (USER_SHEET.getRange(i, 1).getValue() === userId) return true;
  }
  return false;
};

/**
 * 終了処理を正しく行える状態かチェックする
 */
const validateStudyEnd = (userId: string): boolean => {
  const rowNumber = getEndAtUpdateRecordRowNumber(userId);

  // TODO: 開始日時が終了時刻を上回っていた場合のエラーハンドリングができていない
  return rowNumber !== -1;
};

/**
 * 開始処理を正しく行える状態かチェックする
 */
const validateStudyStart = (userId: string): boolean => {
  // 終了処理を正しく行えない = 開始処理ができるとみなす
  return !validateStudyEnd(userId);
};

/**
 * 終了日時を更新する行番号を返す(存在しない場合は-1を返す)
 */
const getEndAtUpdateRecordRowNumber = (userId: string): number => {
  if (!DB_SHEET) return -1;
  const lastRow = DB_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  // 最終行からチェックし、自身、かつ終了日時未入力のレコードがあるか返す
  for (let i = lastRow; i >= 1; i--) {
    if (DB_SHEET.getRange(i, 3).getValue() !== userId) continue;
    return DB_SHEET.getRange(i, 2).isBlank() ? i : -1;
  }
  return -1;
};

/**
 * 作業時間(分)を返す
 */
const getStudyMinutes = (rowNumber: number): number => {
  if (!DB_SHEET) return 0;
  const startCol = 1;
  const endCol = 2;
  // 実施時間を取得
  const startAt = DB_SHEET.getRange(rowNumber, startCol).getValue();
  const endAt = DB_SHEET.getRange(rowNumber, endCol).getValue();
  if (!startAt || !endAt || !validDate(startAt) || !validDate(endAt)) return 0; // 日付でない場合は0として返す
  const diffTime = endAt.getTime() - startAt.getTime();
  if (diffTime < 0) return 0; // 不正な値は0として返す
  return parseInt(String(diffTime / (60 * 1000)));
};

/**
 * 対象日付の合計作業時間(分)を返す
 */
const getTotalStudyMinutes = (userId: string, date: Date | null): number => {
  if (!DB_SHEET) return 0;
  const lastRow = DB_SHEET.getDataRange().getLastRow();
  let totalStudyMinutes = 0;
  for (let i = 1; i <= lastRow; i++) {
    const rowUserId = DB_SHEET.getRange(i, 3).getValue();
    const rowStartDate = DB_SHEET.getRange(i, 1).getValue();
    if (!validDate(rowStartDate)) continue;
    if (
      // 日付がNullの場合は対象ユーザーの全件が対象
      (!date && rowUserId !== userId) ||
      // 日付がある場合は対象ユーザーのうち、対象日付のものだけが対象
      (date &&
        (rowUserId !== userId ||
          getFormatDate(rowStartDate) !== getFormatDate(date)))
    )
      continue;
    const rowMinutes = getStudyMinutes(i);
    totalStudyMinutes += rowMinutes;
  }

  return totalStudyMinutes;
};

/**
 * 日付型かどうか返す
 */
const validDate = (d: Date): boolean => {
  const toStringObject = Object.prototype.toString;
  return toStringObject.call(d) === '[object Date]';
};

/**
 * フォーマットされた日付を返す
 */
const getFormatDate = (d: Date): string => {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`.replace(
    /\n|\r/g,
    ''
  );
};

const getDisplayHourFromMinutes = (totalMinutes: number): string => {
  const hour = parseInt(String(totalMinutes / 60));
  const minutes = parseInt(String(totalMinutes % 60));
  let displayHour = '';
  if (hour > 0) displayHour += `${hour}時間 `;
  displayHour += `${minutes}分`;
  return displayHour;
};

const getUserNotionId = (user: DiscordUser) => {
  if (!existUserId(user.userId)) return null;
  if (!USER_SHEET) return false;
  const lastRow = USER_SHEET.getDataRange().getLastRow(); //対象となるシートの最終行を取得
  if (!lastRow) return false;
  for (let i = 1; i <= lastRow; i++) {
    if (USER_SHEET.getRange(i, 1).getValue() === user.userId) {
      const notionId = USER_SHEET.getRange(i, 4).getValue();
      return notionId ?? null;
    }
  }
  return null;
};

const setDailyAchieved = (user: DiscordUser, achievedDate: string): void => {
  if (!DAILY_ACHIEVED_SHEET) return;
  const lastRow = DAILY_ACHIEVED_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  const newRow = lastRow + 1;
  DAILY_ACHIEVED_SHEET.getRange(newRow, 1).setValue(achievedDate);
  DAILY_ACHIEVED_SHEET.getRange(newRow, 2).setValue(user.userId);
  DAILY_ACHIEVED_SHEET.getRange(newRow, 3).setValue(user.userName);
};

const existDailyAchieved = (
  user: DiscordUser,
  achievedDate: string
): boolean => {
  if (!DAILY_ACHIEVED_SHEET) return false;
  const lastRow = DAILY_ACHIEVED_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  if (!lastRow) return false;
  for (let i = 1; i <= lastRow; i++) {
    const rowDate = DAILY_ACHIEVED_SHEET.getRange(i, 1).getValue();
    const rowUserId = DAILY_ACHIEVED_SHEET.getRange(i, 2).getValue();
    const formattedRowDate = getFormatDate(new Date(rowDate));
    const formattedAchievedDate = getFormatDate(new Date(achievedDate));
    if (
      formattedRowDate === formattedAchievedDate &&
      rowUserId === user.userId
    ) {
      return true;
    }
  }
  return false;
};

/**
 * 対象ユーザーの現在の報酬レベルを取得
 */
const getCurrentRewardLevel = (userId: string): number => {
  if (!USER_SHEET) return 0;
  const lastRow = USER_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  let level = 0;
  for (let i = 2; i <= lastRow; i++) {
    const rowUserId = USER_SHEET.getRange(i, 1).getValue();
    if (rowUserId !== userId) continue;
    level = USER_SHEET.getRange(i, 3).getValue();
  }

  return level;
};

const setCurrentRewardLevel = (userId: string, newLevel: number): void => {
  if (!USER_SHEET) return;
  const lastRow = USER_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  for (let i = 2; i <= lastRow; i++) {
    const rowUserId = USER_SHEET.getRange(i, 1).getValue();
    if (rowUserId !== userId) continue;
    USER_SHEET.getRange(i, 3).setValue(newLevel);
  }
};

const getRewardItems = (): RewardItem[] => {
  const rewardItems: RewardItem[] = [];
  if (!REWARD_SHEET) return rewardItems;
  const lastRow = REWARD_SHEET.getDataRange().getLastRow(); // 対象となるシートの最終行を取得
  for (let i = 2; i <= lastRow; i++) {
    const rewardItem: RewardItem = {
      level: parseInt(REWARD_SHEET.getRange(i, 1).getValue()),
      hours: parseInt(REWARD_SHEET.getRange(i, 2).getValue()),
      point: parseInt(REWARD_SHEET.getRange(i, 3).getValue()),
    };
    rewardItems.push(rewardItem);
  }

  return rewardItems;
};

const updateAchieveLevel = (user: DiscordUser, date: Date) => {
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

  const response: UpdateAchieveLevelResponse = {
    achievedLevel,
    notionUpdateResult,
  }

  return response;
}

/**
 * レスポンスデータを整形して返す
 */
const getResponseJson = (data: DiscordMessageContent) => {
  const payload = JSON.stringify(data);
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(payload);

  return output;
};

const statusNames = {
  start: '自習スタート',
  end: '自習終了',
  report: '自習レポート',
};

const postResultToDiscord = (content: DiscordMessageContent) => {
  let messageContent = `${content.user.userName}さん\n\n`;

  switch (content.status) {
    case 'ok':
      messageContent += `${statusNames[content.type]}です✅\n`;
      if (content.type === 'start') {
        // スタート時は追加メッセージなし
        // TODO: このタイミングでコインをあげても良いかも
      } else if (content.type === 'end') {
        if (content.studyMinutes)
          messageContent += `作業時間: ${getDisplayHourFromMinutes(
            content.studyMinutes
          )}`;
      } else if (content.type == 'report') {
        if (content.studyMinutes)
          messageContent += `今日の合計作業時間: ${getDisplayHourFromMinutes(
            content.studyMinutes
          )}😉`;
        else messageContent += `今日の作業はまだありません😲`;

        if (content.achievedLevel)
          messageContent += `\n報酬レベル${content.achievedLevel}をクリアしました🎉🎉🎉`;
      }
      break;
    case 'error':
      messageContent += `${statusNames[content.type]}に失敗しました🤦‍♀️\n`;
      if (content.errorType === 'UnregisteredUser') {
        messageContent += `ユーザー登録されていないようです👀\n以下スプシの「ユーザーリスト」シートにユーザーを追加してください。\nあなたのDiscord IDは ${content.user.userId} です。\n${SS_SHEET_URL}`;
      } else {
        if (content.errorType === 'invalidAt') {
          messageContent += `日付がうまく取得できなかったようです😭\nお手数ですが管理者へ連絡してください。`;
        } else if (content.errorType === 'invalidSS') {
          messageContent += `スプレッドシートがおかしくなってるっぽいです😭\nお手数ですが管理者へ連絡してください。`;
        } else if (content.errorType === 'invalidStudyStart') {
          messageContent += `未終了のレコードがないかスプシを確認してください👀\n(未終了を忘れた場合は手動で入力してください)\n${SS_SHEET_URL}`;
        } else if (content.errorType === 'invalidStudyEnd') {
          messageContent += `自習がスタートしていないようです👀\n自習を開始するか、おかしなレコードがないかスプシを確認してください。\n${SS_SHEET_URL}`;
        } else {
          messageContent += `想定外のエラーです😭😭😭\nお手数ですが管理者へ連絡してください。`;
        }
      }
      break;
    default:
      messageContent += `想定外のエラーです。。\nお手数ですが管理者へ連絡してください。`;
  }

  switch (content.notionUpdateResult) {
    case 'ok':
      messageContent += `\n\nNotionへのクエスト達成のデータも更新済みです🪙`;
      break;
    case 'ng':
      messageContent += `\n\nNotionの更新に失敗しました😱\nお手数ですが手動で達成クエストを追加してください🙏\n${QUEST_PAGE_URL}`;
  }

  UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ content: messageContent }),
  });
  return getResponseJson(content);
};
