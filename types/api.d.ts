import { JSONSchema6 } from "json-schema";

import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
export * from "~/config/api";

export type ApiItemFields = typeof ID_FIELD | typeof PARENT_FIELD | typeof TITLE_FIELD | typeof TYPE_FIELD;

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
  //id: string;
  [ID_FIELD]: UUID;
  [TYPE_FIELD]: UUID;
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

export interface ApiSchema extends JSONSchema6 {}

interface ApiRoutes {
  "/login": {
    POST: {
      body: {
        username: string;
        password: string;
      };
    };
  };
  "/elements": {
    GET: {
      query: {
        parent?: UUID;
      };
      response: ApiItem[];
    };
    POST: {
      body: ApiItem;
    };
  };
  "/elements/:id": {
    GET: {
      params: {
        id: UUID;
      };
      response: ApiItem;
    };
    PUT: {
      params: {
        id: UUID;
      };
      body: ApiItem;
    };
    DELETE: {
      params: {
        id: UUID;
      };
    };
  };
  "/elements/:id/children": {
    GET: {
      params: {
        id: UUID;
      };
      response: ApiItem[];
    };
  };
  "/elements/:id/links": {
    GET: {
      params: {
        id: UUID;
      };
      response: ApiLink[];
    };
  };
  "/elements/:id/history": {
    GET: {
      params: {
        id: UUID;
      };
      response: ApiLink[];
    };
  };
  "/links/:id": {
    DELETE: {
      params: {
        id: UUID;
      };
    };
  };
  "/schemas": {
    GET: {
      params: {
        id: UUID;
      };
      response: string[];
    };
  };
  "/schemas/:name.json": {
    GET: {
      params: {
        name: string;
      };
      response: ApiSchema;
    };
  };
}
