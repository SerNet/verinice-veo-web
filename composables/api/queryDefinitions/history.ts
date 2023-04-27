/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { IVeoEntity } from "~~/types/VeoTypes";
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";
import { formatObject } from "./objects";

export interface IVeoObjectHistoryEntry {
  author: string;
  content: IVeoEntity;
  time: string;
  type: string;
  changeNumber: number;
  uri: string;
}

export interface IVeoFetchVersionsParameters {
  object: IVeoEntity;
  endpoint: string;
}

export interface IVeoFetchLatestChangesParameters {
  unitId: string;
}

export interface IVeoFetchPagedRevisionsParameters {
  size?: string;
  afterId?: string;
}

export interface IVeoPagedRevision {
  "totalItemCount": 0,
  "items": IVeoObjectHistoryEntry[] 
}

export default {
  queries: {
    fetchVersions: {
      primaryQueryKey: 'versions',
      url: '/api/history/revisions',
      queryParameterTransformationFn: (queryParameters) => ({ query: { uri: `/${queryParameters.endpoint}/${queryParameters.object.id}` } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY
      },
      onDataFetched: (data) => data.map((entry) => ({ ...entry, content: formatObject(entry.content) }))
    } as IVeoQueryDefinition<IVeoFetchVersionsParameters, IVeoObjectHistoryEntry[]>,
    fetchLatestVersions: {
      primaryQueryKey: 'latestVersions',
      url: '/api/history/revisions/my-latest',
      queryParameterTransformationFn: (queryParameters) => ({ query: { owner: `/units/${queryParameters.unitId}` } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.REQUEST
      },
      onDataFetched: (data) => data.map((entry) => ({ ...entry, content: formatObject(entry.content) }))
    } as IVeoQueryDefinition<IVeoFetchLatestChangesParameters, IVeoObjectHistoryEntry[]>,
    fetchPagedRevisions: {
      primaryQueryKey: 'pagedRevisions',
      url: '/api/history/revisions/paged',
      queryParameterTransformationFn: (queryParameters) => (
        { query: {size: queryParameters.size, afterId: queryParameters?.afterId} }
      )
    } as IVeoQueryDefinition<IVeoFetchPagedRevisionsParameters, IVeoPagedRevision>
  },
  mutations: {}
};
