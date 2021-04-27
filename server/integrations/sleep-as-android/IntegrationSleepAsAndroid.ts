import { concat, EMPTY, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { IntegrationGoogleClient } from '../google/IntegrationGoogleClient';
import { isDefined } from '../../common/type-guards';

export class IntegrationSleepAsAndroid extends IntegrationGoogleClient {
  // Optional date specifying the newest value that can be returned
  // Be aware of this stream will emit multiple times if it has pagination
  getSleepRecords$ = (fromDate: Date = new Date('1990-01-01')) =>
    this.getAccessToken$(['https://www.googleapis.com/auth/userinfo.email']).pipe(
      mergeMap((token) => {
        const timestamp = fromDate.getTime();
        const createRequest$ = (cursor?: string): Observable<ISleepAsAndroidResults> =>
          fromFetch(
            `https://sleep-cloud.appspot.com/fetchRecords?timestamp=${timestamp}&labels=true&tags=true&comments=true${
              isDefined(cursor) ? `&cursor=${cursor}` : ''
            }`,
            {
              method: 'GET',
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          ).pipe(
            mergeMap((response) => response.json() as Promise<ISleepAsAndroidResults>),
            mergeMap((res) =>
              concat(of(res), isDefined(res.cursor) ? createRequest$(res.cursor) : EMPTY)
            )
          );
        return createRequest$().pipe(map((res) => res.sleeps));
      })
    );
}

export interface ISleepAsAndroidSleep {
  fromTime: number; // Unix timestamp of sleep start tracking time
  toTime: number; // Unix timestamp of end of sleep tracking
  timezone: string; // in the GMT sign hours : minutes format (example GMT+03:00)
  lengthMinutes: number; // Duration of the sleep in minutes (does not need to match to `fromTime`, due to pausing, delayed tracking, etc..)
  rating?: number; // 0 - 5 floating point number, about user perceived quality rating of the sleep
  deepSleep?: number; // 0 - 1 floating point number, percentage of night spent in deep sleep
  noiseLevel?: number; // Average level of noise during the night. The higher the noisy
  snoringSeconds?: number; // A total number of seconds when snoring was detected
  cycles?: number; // number of sleep cycle phases
  actigraph?: number[]; // 0 - 10 floating point number
  labels?: {
    label: ESleepAsAndroidLabel;
    timestamp: number;
  }[]; // The labels are sorting in time ascending order
  tags?: string[]; // An array of lifestyle tags assigned to the sleep by the user or automatically
  comment?: string; // comment entered by the user
}

export enum ESleepAsAndroidLabel {
  DHA = 'DHA', // IDK
  DEVICE = 'DEVICE', // IDK
  LUX = 'LUX', // IDK, mb it's a unit of illuminance?

  ALARM_EARLIEST = 'ALARM_EARLIEST', // The earliest time, when alarm could have possibly ring.
  ALARM_LATEST = 'ALARM_LATEST', // The latest time, when alarm could have possibly ring.
  ALARM_SNOOZE = 'ALARM_SNOOZE', // User snoozed an alarm.
  ALARM_SNOOZE_AFTER_KILL = 'ALARM_SNOOZE_AFTER_KILL', // Alarm was automatically snoozed due to alarm timeout
  ALARM_DISMISS = 'ALARM_DISMISS', // User successfully dismissed alarm.
  TRACKING_PAUSED = 'TRACKING_PAUSED', // Start of a wake up time
  TRACKING_RESUMED = 'TRACKING_RESUMED', // End of the wake up time
  TRACKING_STOPPED_BY_USER = 'TRACKING_STOPPED_BY_USER', // User stopped tracking
  ALARM_STARTED = 'ALARM_STARTED', // Alarm started ringing
  SNORING = 'SNORING', // Snoring detected
  LOW_BATTERY = 'LOW_BATTERY', // Battery is low, tracking won’t work correctly
  DEEP_START = 'DEEP_START', // Deep sleep phase started
  DEEP_END = 'DEEP_END', // Deep sleep phase finished
  LIGHT_START = 'LIGHT_START', // Light sleep phase started
  LIGHT_END = 'LIGHT_END', // Light sleep phase finished
  REM_START = 'REM_START', // REM sleep phase started
  REM_END = 'REM_END', // REM sleep phase finished
  BROKEN_START = 'BROKEN_START', // No data from sensors in this period (maybe battery is empty)
  BROKEN_END = 'BROKEN_END', // No data from sensors finished
  WALKING_START = 'WALKING_START', // Start of a walking period (imported from Google Fit)
  WALKING_END = 'WALKING_END', // End of a walking period (imported from Google Fit)
  AWAKE_START = 'AWAKE_START', // Awake period started (from awake detection algorithm)
  AWAKE_END = 'AWAKE_END', // Awake period ended (from awake detection algorithm)
  HR = 'HR', // Heart rate value
  HR_HIGH_START = 'HR_HIGH_START', // Heart rate value
  HR_HIGH_END = 'HR_HIGH_END', // Heart rate value
  LUCID_CUE = 'LUCID_CUE', // REM sleep detected and playing a lucid dreaming cue
  SPO2 = 'SPO2', // SpO2 value
  APNEA = 'APNEA', // Apnea episode detected
  RR = 'RR', // Respiratory rate value
}

export interface ISleepAsAndroidResults {
  sleeps: ISleepAsAndroidSleep[];
  cursor?: string;
}
