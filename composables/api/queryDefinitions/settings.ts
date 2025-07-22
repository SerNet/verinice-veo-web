/*
 * verinice.veo web
 * Copyright (C) 2025 Haneen Husin
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
 *
 *
 * verinice.veo web
 * Copyright (C) 2025 Haneen Husin
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
import { IVeoMutationDefinition } from '../utils/mutation';
import { IVeoQueryDefinition } from '../utils/query';
import { VeoApiReponseType } from '../utils/request';
import { UserSettings } from '../useSettings';

export interface IVeoFetchSettingsParameters {
  appId: string;
}

export interface IVeoUpdateSettingParameters {
  appId: string;
  settings: UserSettings;
}

export default {
  queries: {
    fetchSettings: {
      primaryQueryKey: 'userSettings',
      url: '/api/user-configurations',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: { placeholderData: [] }
    } as IVeoQueryDefinition<IVeoFetchSettingsParameters>,
    fetchSettingsWithAppId: {
      primaryQueryKey: 'userSettings',
      url: '/api/user-configurations/:appId',
      queryParameterTransformationFn: (params) => ({
        params
      }),
      staticQueryOptions: { placeholderData: [] }
    } as IVeoQueryDefinition<IVeoFetchSettingsParameters, UserSettings>
  },
  mutations: {
    updateSettings: {
      primaryQueryKey: 'userSettings',
      url: '/api/user-configurations/:appId',
      method: 'PUT',
      responseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => {
        return {
          params: {
            appId: mutationParameters.appId
          },
          json: mutationParameters.settings
        };
      },

      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['userSettings', { userId: variables.params?.appId }]);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateSettingParameters, void>
  }
};
