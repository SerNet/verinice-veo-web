import type { IVeoEntity, IVeoEntityLegacy } from '~/types/VeoTypes';

export type IVeoLegacyObjectHistoryEntry = IVeoHistoryEntry<IVeoEntityLegacy>;

export type IVeoObjectHistoryEntry = IVeoHistoryEntry<IVeoEntity>;

interface IVeoHistoryEntry<T> {
  author: string;
  content: T;
  time: string;
  type: string;
  changeNumber: number;
  uri: string;
  id: string;
}

export interface IVeoPagedRevision {
  totalItemCount: 0;
  items: IVeoObjectHistoryEntry[];
}
