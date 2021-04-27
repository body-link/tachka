export interface ISchemaCommonImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface ISchemaSleepStage {
  stage: 'DEEP' | 'LIGHT' | 'REM' | 'WAKE';
  dateTime: string;
  seconds: number;
}

export interface ISchemaSleepEpisode {
  startDateTime: string;
  endDateTime: string;
  fallAsleepDateTime: string;
  wakeupDateTime: string;
  isMainSleep?: boolean;
  latencyToSleepOnsetMinutes?: number;
  latencyToArisingOnsetMinutes?: number;
  asleepMinutes?: number;
  awakeMinutes?: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  REMSleepMinutes?: number;
  snoringSeconds?: number;
  efficiencyPercentage?: number;
  stages?: ISchemaSleepStage[];
}
