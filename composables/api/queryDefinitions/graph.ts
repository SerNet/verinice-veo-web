/*
 * verinice.veo web
 * Copyright (C) 2025 sernet
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
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

export type IGraphResult = {
  nodes: IGraphNode[];
  links: IGraphLink[];
};
export type IGraphNode = {
  displayName: string;
  elementType: string;
  elementSubType: string;
  id: string;
  elementId: string;
};

export type IGraphLink = {
  type: string;
  source: string;
  target: string;
  label: string;
};
export interface GraphParams {
  domainId: string;
  elementId: string;
  elementType: string;
}

export default {
  queries: {
    fetchElementRelations: {
      primaryQueryKey: 'elementRelations',
      url: '/api/domains/:domainId/:elementType/:elementId/relations',

      queryParameterTransformationFn: (params) => ({
        params: {
          domainId: String(params.domainId),
          elementId: String(params.elementId),
          elementType: String(params.elementType)
        }
      }),
      onDataFetched: (result) => {
        return result;
      }
    } as IVeoQueryDefinition<GraphParams, IGraphResult>
  }
};
