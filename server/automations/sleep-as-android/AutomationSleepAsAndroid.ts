import * as A from 'fp-ts/lib/Array';
import { addSeconds, differenceInMinutes, differenceInSeconds, isSameDay } from 'date-fns';
import { of } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { recordCreate$, recordCreateOptions } from '../../entities/record/actions/create';
import {
  dateToTimestamp,
  decodeWith,
  timestampToDate,
  timezoneGMTtoOffset,
} from '../../common/io/utils';
import { Automation } from '../common/Automation';
import { recordList$, TRecordListOptions } from '../../entities/record/actions/list';
import { debug } from '../../common/rxjs-utils';
import { IRecordCreateRaw, IRecordRefine } from '../../entities/record/types';
import { EBuiltInBucket } from '../../buckets/built-in/register';
import { ISchemaAutomationSleepAsAndroidOptions } from './schema-options';
import { EAutomation } from '../register';
import {
  ESleepAsAndroidLabel,
  IntegrationSleepAsAndroid,
} from '../../integrations/sleep-as-android/IntegrationSleepAsAndroid';
import { isDefined } from '../../common/type-guards';
import { TOption, TUnboxArray } from '../../common/type-utils';
import { groupArray } from '../../common/utils';
import { ISchemaSleepEpisode, ISchemaSleepStage } from '../../schemas/types';

export class AutomationSleepAsAndroid extends Automation<ISchemaAutomationSleepAsAndroidOptions> {
  readonly name = EAutomation.SleepAsAndroid;
  readonly API = new IntegrationSleepAsAndroid(this.options.profile);

  readonly work$ = of({
    group: this.options.recordGroup,
    provider: this.name,
    bucket: EBuiltInBucket.SleepEpisode,
  } as TRecordListOptions).pipe(
    mergeMap(recordList$),
    mergeMap((records) => {
      if (records.length > 0) {
        const existing = records.map(
          (v) => (v as IRecordRefine<ISchemaSleepEpisode>).data.startDateTime
        );
        return this.API.getSleepRecords$(timestampToDate(records[0].timestamp)).pipe(
          map((items) => items.filter((v) => !existing.includes(new Date(v.fromTime).toJSON())))
        );
      } else {
        return this.API.getSleepRecords$(this.options.initialFromDate);
      }
    }),
    filter(A.isNonEmpty),
    map((records) => {
      const sleepEpisodes = records.map((record) => {
        const stages: ISchemaSleepStage[] = [];
        const startDateTime = new Date(record.fromTime).toJSON();
        const endDateTime = new Date(record.toTime).toJSON();

        const sleepEpisode: ISchemaSleepEpisode = {
          startDateTime,
          endDateTime,
          fallAsleepDateTime: startDateTime,
          wakeupDateTime: endDateTime,
        };

        if (isDefined(record.snoringSeconds)) {
          sleepEpisode.snoringSeconds = record.snoringSeconds;
        }

        record.labels?.reduce<TOption<number>[]>((acc, { label, timestamp }) => {
          const index = pairs.findIndex((pair) => pair.includes(label));
          if (index > -1) {
            const prevTimestamp = acc[index];
            if (isDefined(prevTimestamp)) {
              const startDate = Math.min(prevTimestamp, timestamp);
              const endDate = Math.max(prevTimestamp, timestamp);
              stages.push({
                stage: getSleepStageBasedOnPairIndex(index),
                dateTime: new Date(startDate).toJSON(),
                seconds: differenceInSeconds(endDate, startDate),
              });
              acc[index] = undefined;
            } else {
              acc[index] = timestamp;
            }
          }
          return acc;
        }, []);

        if (stages.length > 0) {
          optimizeSleepStage(stages);

          const potentialWakeSpanToFirstStageSeconds = differenceInSeconds(
            new Date(stages[0].dateTime),
            new Date(startDateTime)
          );
          if (potentialWakeSpanToFirstStageSeconds > 3) {
            stages.unshift({
              stage: 'WAKE',
              dateTime: startDateTime,
              seconds: potentialWakeSpanToFirstStageSeconds,
            });
          }

          const potentialWakeSpanToLastStageSeconds = differenceInSeconds(
            new Date(endDateTime),
            new Date(stages[stages.length - 1].dateTime)
          );
          if (potentialWakeSpanToLastStageSeconds > 3) {
            stages.push({
              stage: 'WAKE',
              dateTime: stages[stages.length - 1].dateTime,
              seconds: potentialWakeSpanToLastStageSeconds,
            });
          }

          const firstSleepStage = stages.find((s) => s.stage !== 'WAKE');
          if (isDefined(firstSleepStage)) {
            if (
              new Date(firstSleepStage.dateTime).getTime() -
                new Date(sleepEpisode.fallAsleepDateTime).getTime() >
              0
            ) {
              sleepEpisode.fallAsleepDateTime = firstSleepStage.dateTime;
            }
          }

          const lastSleepStage = [...stages].reverse().find((s) => s.stage !== 'WAKE');
          if (isDefined(lastSleepStage)) {
            const potentialWakeupDateTime = addSeconds(
              new Date(lastSleepStage.dateTime),
              lastSleepStage.seconds
            );
            if (
              new Date(sleepEpisode.wakeupDateTime).getTime() - potentialWakeupDateTime.getTime() >
              0
            ) {
              sleepEpisode.wakeupDateTime = potentialWakeupDateTime.toJSON();
            }
          }

          sleepEpisode.latencyToSleepOnsetMinutes = differenceInMinutes(
            new Date(sleepEpisode.fallAsleepDateTime),
            new Date(sleepEpisode.startDateTime)
          );

          sleepEpisode.latencyToArisingOnsetMinutes = differenceInMinutes(
            new Date(sleepEpisode.endDateTime),
            new Date(sleepEpisode.wakeupDateTime)
          );

          const { asleep, awake, deepSleep, lightSleep, REMSleep } = stages.reduce(
            (acc, s) => {
              if (s.stage === 'DEEP') {
                acc.asleep += s.seconds;
                acc.deepSleep += s.seconds;
              } else if (s.stage === 'LIGHT') {
                acc.asleep += s.seconds;
                acc.lightSleep += s.seconds;
              } else if (s.stage === 'REM') {
                acc.asleep += s.seconds;
                acc.REMSleep += s.seconds;
              } else if (s.stage === 'WAKE') {
                acc.awake += s.seconds;
              }
              return acc;
            },
            {
              asleep: 0,
              awake: 0,
              deepSleep: 0,
              lightSleep: 0,
              REMSleep: 0,
            }
          );

          sleepEpisode.asleepMinutes = secondsToMinutes(asleep);
          sleepEpisode.awakeMinutes = secondsToMinutes(awake);
          sleepEpisode.deepSleepMinutes = secondsToMinutes(deepSleep);
          sleepEpisode.lightSleepMinutes = secondsToMinutes(lightSleep);
          sleepEpisode.REMSleepMinutes = secondsToMinutes(REMSleep);

          sleepEpisode.efficiencyPercentage = Number(
            (
              (sleepEpisode.asleepMinutes /
                differenceInMinutes(
                  new Date(sleepEpisode.wakeupDateTime),
                  new Date(sleepEpisode.fallAsleepDateTime)
                )) *
              100
            ).toFixed(2)
          );

          sleepEpisode.stages = stages;
        }

        return sleepEpisode;
      });

      const mapMains = records.map((record, index) => ({
        end: record.toTime,
        length: record.lengthMinutes,
        index,
      }));

      groupArray<TUnboxArray<typeof mapMains>>({ equals: (a, b) => isSameDay(a.end, b.end) })(
        mapMains
      ).forEach((dayMapMains) => {
        const mapMain = dayMapMains.reduce(
          (prev, next) => (prev.length > next.length ? prev : next),
          dayMapMains[0]
        );
        dayMapMains.forEach((dmm) => (sleepEpisodes[dmm.index].isMainSleep = mapMain === dmm));
      });

      const potentialRecords: IRecordCreateRaw[] = [];

      records.forEach((record, index) => {
        const sleepEpisode = sleepEpisodes[index];

        const basic = {
          group: this.options.recordGroup,
          provider: this.name,
          timestamp: dateToTimestamp(new Date(sleepEpisode.endDateTime)),
          offset: timezoneGMTtoOffset(record.timezone),
        };

        potentialRecords.push({
          ...basic,
          bucket: EBuiltInBucket.SleepEpisode,
          data: sleepEpisode,
        });

        record.tags?.forEach((tag) => {
          potentialRecords.push({
            ...basic,
            bucket: EBuiltInBucket.Tag,
            data: `😴 ${tag}`,
          });
        });

        if (isDefined(record.comment)) {
          potentialRecords.push({
            ...basic,
            bucket: EBuiltInBucket.Note,
            data: record.comment,
          });
        }

        if (isDefined(record.rating)) {
          potentialRecords.push({
            ...basic,
            bucket: EBuiltInBucket.Label,
            data: {
              label: 'Sleep Rating',
              value: {
                min: 0,
                max: 5,
                value: record.rating,
              },
            },
          });
        }
      });

      return potentialRecords;
    }),
    map(decodeWith(recordCreateOptions)),
    mergeMap((records) => recordCreate$(records)),
    debug(this.name)
  );
}

const pairs = [
  [ESleepAsAndroidLabel.DEEP_START, ESleepAsAndroidLabel.DEEP_END],
  [ESleepAsAndroidLabel.LIGHT_START, ESleepAsAndroidLabel.LIGHT_END],
  [ESleepAsAndroidLabel.REM_START, ESleepAsAndroidLabel.REM_END],
  [ESleepAsAndroidLabel.WALKING_START, ESleepAsAndroidLabel.WALKING_END],
  [ESleepAsAndroidLabel.AWAKE_START, ESleepAsAndroidLabel.AWAKE_END],
  [ESleepAsAndroidLabel.TRACKING_PAUSED, ESleepAsAndroidLabel.TRACKING_RESUMED],
];

const getSleepStageBasedOnPairIndex = (pairIndex: number): ISchemaSleepStage['stage'] => {
  switch (pairIndex) {
    case 0:
      return 'DEEP';
    case 1:
      return 'LIGHT';
    case 2:
      return 'REM';
    default:
      return 'WAKE';
  }
};

const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);

// Sort and handle overlap stages
const optimizeSleepStage = (stages: ISchemaSleepStage[]): ISchemaSleepStage[] => {
  stages.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const tails = stages.reduce<ISchemaSleepStage[]>((acc, s, i) => {
    const nextS = stages[i + 1];
    if (isDefined(nextS)) {
      const distance = differenceInSeconds(new Date(nextS.dateTime), new Date(s.dateTime));
      if (s.seconds > distance) {
        if (s.seconds > distance + nextS.seconds) {
          acc.push({
            stage: s.stage,
            seconds: s.seconds - (distance + nextS.seconds),
            dateTime: addSeconds(new Date(nextS.dateTime), nextS.seconds).toJSON(),
          });
        }
        s.seconds = distance;
      }
    }
    return acc;
  }, []);

  if (tails.length > 0) {
    stages.push(...tails);
    return optimizeSleepStage(stages);
  }

  return stages;
};
