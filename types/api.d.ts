import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";

export type UUID = string;

export interface ApiItem {
  [ID_FIELD]?: UUID;
  [PARENT_FIELD]: UUID;
  [TITLE_FIELD]: string;
  [TYPE_FIELD]: string;
  schema?: string;
  title?: string;
}

export interface ApiLink {
  id: string;
  source: string;
  target: string;
  schema: string;
}

export interface ApiHistory {
  author: string;
  data: string;
  dataId: string;
  timestamp: string;
}

export interface ApiUserTokenPayload {
  exp: number;
  sub: string;
  iss: string;
  iat: number;
  aud: string;
  profiles: string[];
}
