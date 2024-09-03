import { StringSession } from 'telegram/sessions';
import { EntityLike } from 'telegram/define';

export type User = {
  id: number;
  login: string;
  password: string;
  isAdmin: boolean;
};

export interface IConfig {
  providerName: string;
  telegram: {
    apiId: number;
    apiHash: string;
    stringSession: StringSession | string;
    channelUsername: EntityLike;
    MESSAGES_LIMIT: number;
  };
}
