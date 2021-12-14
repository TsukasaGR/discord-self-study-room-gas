/* eslint-disable @typescript-eslint/no-unused-vars */
const DISCORD_WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty('DISCORD_WEBHOOK_URL') ??
  '';
const SS_SHEET_URL =
  PropertiesService.getScriptProperties().getProperty('SS_SHEET_URL') ?? '';
const QUEST_PAGE_URL =
  PropertiesService.getScriptProperties().getProperty('QUEST_PAGE_URL') ?? '';
const SS = SpreadsheetApp.openById(
  SpreadsheetApp.getActiveSpreadsheet().getId()
);
const NOTION_TOKEN =
  PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN') ?? '';
const QUEST_DB_ID =
  PropertiesService.getScriptProperties().getProperty('QUEST_DB_ID') ?? '';
const USER_SHEET = SS.getSheetByName('ユーザーリスト');
const DB_SHEET = SS.getSheetByName('自習DB');
const REWARD_SHEET = SS.getSheetByName('報酬リスト');
const DAILY_ACHIEVED_SHEET = SS.getSheetByName('日別自習達成リスト');
const GLITCH_URL =
  PropertiesService.getScriptProperties().getProperty('GLITCH_URL') ?? '';
