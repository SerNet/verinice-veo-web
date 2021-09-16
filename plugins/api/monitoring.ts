/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { Client } from '~/plugins/api';
import { IVeoDeploymentInformation } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Retrieves meta information for a service.
     *
     * @param service the service to retrieve the information for
     */
    fetchDeploymentDetails(service: 'default' | 'forms' | 'reporting' | 'history'): Promise<IVeoDeploymentInformation> {
      switch (service) {
        case 'forms':
          return api.req(`/api/forms/actuator/info`);
        case 'reporting':
          return api.req(`/api/reports/actuator/info`);
        case 'history':
          return api.req(`/api/history/actuator/info`);
        default:
          return api.req(`/api/actuator/info`);
      }
    }
  };
}
