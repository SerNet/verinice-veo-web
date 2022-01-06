/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
import { VeoAlertType } from './VeoTypes';

export interface IVeoEventPayload {
  type?: VeoAlertType;
  text: string;
  title?: string;
  saveButtonText?: string;
  objectModified?: boolean; // ToDo: Temporary until objects rework
  refetchCallback?: CallableFunction; // ToDo: Temporary until objects rework
}

export const VeoEvents = {
  SNACKBAR_SUCCESS: 'snackbar_success',
  ALERT_ERROR: 'alert_error',
  ALERT_INFO: 'alert_info',
  ALERT_EXPIRE: 'alert_expire',

  DOMAIN_CHANGED: 'domain_changed',
  UNIT_CREATE: 'unit-create',
  UNIT_CHANGED: 'unit_changed',

  ENTITY_UPDATED: 'entity_updated'
};
