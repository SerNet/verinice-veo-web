import { ApiItem, UUID } from "~/types/api";

export interface AppElement {
  id: UUID;
  title: string;
  parent?: UUID;
  type: string;
  data: ApiItem;
}

export interface AppLink {
  id: UUID;
  type: string;
  sourceId: UUID;
  targetId: UUID;
  source?: AppElement;
  target?: AppElement;
}

export type AppElementMap = Record<UUID, AppElement>;
export type AppElementsMap = Record<UUID, AppElement[]>;
export type UUIDsMap = Record<UUID, UUID[]>;
