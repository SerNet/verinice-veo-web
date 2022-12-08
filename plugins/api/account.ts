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

export interface IVeoAccount {
  id: string;
  username: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  groups: string[];
  enabled: boolean;
}

export default function (api: Client) {
  return {
    /**
     * Loads all accounts
     *
     * @param query Additional request query params
     * @returns a list containing all accounts in the client
     */
    fetchAll(query: Record<string, string> = {}): Promise<IVeoAccount[]> {
      return api.req('/api/accounts/', {
        query
      });
    },
    /**
     * Loads a specific accounts
     *
     * @param id ID of the account to load
     * @param query Additional request query params
     * @returns the requested account
     */
    fetch(id: string, query: Record<string, string> = {}): Promise<IVeoAccount[]> {
      return api.req('/api/accounts/:id', {
        params: {
          id
        },
        query
      });
    }
  };
}
