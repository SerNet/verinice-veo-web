/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
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
import { IVeoQueryDefinition, STALE_TIME } from '../utils/query';

interface IVeoObjectControlEntry {
  abbreviation: string;
  createdAt: string;
  createdBy: string;
  customAspects: {
    control_bpInformation: {
      domains: {
        id: string;
        displayName: string;
        name: string;
        [key: string]: any;
      }[];
      attributes: {
        control_bpInformation_protectionApproach: string;
      };
    };
    control_bpCompendium: {
      domains: {
        id: string;
        displayName: string;
        name: string;
        [key: string]: any;
      }[];
      attributes: {
        control_bpCompendium_content: string;
      };
    };
  };
  designator: string;
  domains: {
    [key: string]: any;
  };
  id: string;
  links: {
    control_relevantAppliedThreat: any[];
  };
  name: string;
  owner: {
    id: string;
    displayName: string;
    name: string;
    [key: string]: any;
  };
  parts: any[];
  type: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IVeoFetchControlParameters {
  id: string;
}

export default {
  queries: {
    fetchControl: {
      primaryQueryKey: 'control',
      url: '/api/controls/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: { id: queryParameters.id }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchControlParameters, IVeoObjectControlEntry>
  },
  mutations: {}
};
