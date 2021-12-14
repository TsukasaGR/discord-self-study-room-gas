/* eslint-disable @typescript-eslint/no-unused-vars */
type ProcessStatus = 'ok' | 'error';

type DiscordUser = {
  userId: string;
  userName: string;
};

type DiscordMessageContent = {
  type: DiscordFuncType;
  status: ProcessStatus;
  user: DiscordUser;
  errorType?: ErrorType;
  studyMinutes?: number;
  achievedLevel?: number;
  notionUpdateResult?: NotionUpdatedResult;
};

type ResponseFromSS = {
  status: string;
  errorType: string | null;
  studyMinutes?: number;
  achievedLevel?: number;
};

type DiscordFuncType = 'start' | 'end' | 'report';

type PayloadFromDiscord = {
  postData: GoogleAppsScript.Base.Blob;
};

type JsonPayloadFromDiscord = {
  type: DiscordFuncType;
  at?: string;
  userId: string;
  userName: string;
};

type ErrorType =
  | 'UnregisteredUser'
  | 'invalidAt'
  | 'invalidSS'
  | 'invalidStudyStart'
  | 'invalidStudyEnd';

type RewardItem = {
  level: number;
  hours: number;
  point: number;
};

type QuestType = 'daily' | 'levelUp';

type NotionUpdatedResult = 'ok' | 'skip' | 'ng';
