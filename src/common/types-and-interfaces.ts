import {StringSession} from 'telegram/sessions';
import {EntityLike} from 'telegram/define';

/** Name of the electricity service provider */
export enum ELECTRICITY_PROVIDER {
    CHERKOE = 'CHERKOE',
    ZOE = 'ZOE',
}

export enum ELECTRICITY_STATUS {
    ON = 'on',
    OFF = 'off',
}

export interface IEoffEvent {
    startTime: string; // e.g. "18:00"
    endTime: string; // e.g. "18:00"
    queue: string; // e.g. "2"
    date: string; // e.g. "2024-09-02"
    electricity: ELECTRICITY_STATUS; // "on"/"off"
    provider: ELECTRICITY_PROVIDER; // "CHERKOE"
}

export interface ISchedule {
    events: IEoffEvent[];
    hasTodayData: boolean;
    hasTomorrowData: boolean;
}

export interface IConfig {
    telegram: {
        apiId: number;
        apiHash: string;
        stringSession: StringSession | string;
        cherkoeChannel: EntityLike;
        MESSAGES_LIMIT: number;
    };
}
