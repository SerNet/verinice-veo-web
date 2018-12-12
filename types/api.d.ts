import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";

export type ItemId = string;

export interface VeoItem {
  [ID_FIELD]?: ItemId;
  [PARENT_FIELD]: ItemId;
  [TITLE_FIELD]: string;
  [TYPE_FIELD]: string;
  schema?: string;
  title?: string;
}

export interface VeoLink {
  id: string;
  source: string;
  target: string;
  schema: string;
}

export interface VeoUserTokenPayload {
  exp: number;
  sub: string;
  iss: string;
  iat: number;
  aud: string;
  profiles: string[];
}
