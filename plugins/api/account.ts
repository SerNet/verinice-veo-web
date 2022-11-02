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
    },
    /**
     * Creates an account
     *
     * @param account The new account data
     * @param query Additional query params
     * @returns 201 if successful
     */
    create(account: IVeoAccount, query: Record<string, string> = {}): Promise<void> {
      return api.req('/api/accounts/', {
        method: 'POST',
        query,
        json: account
      });
    },
    /**
     * Updates an account
     *
     * @param id The account to update
     * @param account The new account data
     * @param query Additional query params
     * @returns 204 if successful
     */
    update(id: string, account: IVeoAccount, query: Record<string, string> = {}): Promise<void> {
      return api.req('/api/accounts/:id', {
        method: 'PUT',
        params: {
          id
        },
        query,
        json: account
      });
    },
    /**
     * Deletes a single account
     *
     * @param id The account to delete
     * @param query Additional query params
     * @returns 204 if successful
     */
    _delete(id: string, query: Record<string, string> = {}): Promise<void> {
      return api.req('/api/accounts/:id', {
        method: 'DELETE',
        params: {
          id
        },
        query
      });
    }
  };
}
