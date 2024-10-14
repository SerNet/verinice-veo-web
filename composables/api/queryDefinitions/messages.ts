/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import type { IVeoQueryDefinition } from '../utils/query';

export interface IVeoFetchMessageParameters {
  id: string;
}

export interface IVeoSystemMessage {
  id: number;
  message: Record<string, string>;
  createdAt: string;
  publication: string;
  effective: string;
  level: IVeoSystemMessageAlertType;
}

export type IVeoSystemMessageAlertType = 'INFO' | 'WARNING' | 'URGENT';

export default {
  queries: {
    fetchAll: {
      primaryQueryKey: 'messages',
      url: '/api/messages'
    } as IVeoQueryDefinition<Record<string, never>, IVeoSystemMessage[]>,
    fetch: {
      primaryQueryKey: 'message',
      url: '/api/messages/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: queryParameters
      })
    } as IVeoQueryDefinition<IVeoFetchMessageParameters, IVeoSystemMessage>
  }
};
