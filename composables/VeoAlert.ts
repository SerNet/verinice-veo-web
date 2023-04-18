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
import { Ref } from 'vue';

import { IVeoGlobalAlert, IVeoGlobalAlertParams, VeoAlertType } from '~/types/VeoTypes';

const alerts: Ref<IVeoGlobalAlert[]> = ref([]);

export function useVeoAlerts() {
  /**
   * Internal function that handles adding the message to the alerts array ready for displaying
   *
   * @param type Type of the message
   * @param title Title of the message
   * @param text Text of the message. Not required for all message types
   * @param params Additional params to further customize certain messages
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displayMessage(type: VeoAlertType, title: string, text: string | undefined, params?: IVeoGlobalAlertParams) {
    const alertKey = Date.now();
    alerts.value.push({
      type,
      title,
      text,
      params,
      alertKey
    });
    return alertKey;
  }

  /**
   * Displays an error message consisting of a title, text and button.
   *
   * @param title Title of the error message
   * @param text Text of the error message
   * @param params Text of the button. If set to undefined, "Okay" will be used
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displayErrorMessage(title: string, text: string, params?: IVeoGlobalAlertParams): number {
    return displayMessage(VeoAlertType.ERROR, title, text, params);
  }

  /**
   * Displays an info message consisting of a title, text and button.
   *
   * @param title Title of the info message
   * @param text Text of the info message
   * @param buttonText Text of the button. If set to undefined, "Okay" will be used
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displayInfoMessage(title: string, text: string, params?: IVeoGlobalAlertParams): number {
    return displayMessage(VeoAlertType.INFO, title, text, params);
  }

  /**
   * Displays a simple success message
   *
   * @param text Text to display
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displaySuccessMessage(text: string, params?: IVeoGlobalAlertParams): number {
    return displayMessage(VeoAlertType.SUCCESS, text, '', { ...params, timeout: 5000 });
  }

  /**
   * Expire an alert. Usually gets called under the hood by VeoGlobalAlert if the timeout is reached or the close button is clicked.
   * However you can call it yourself if you programmatically want to close an alert. Just make sure to remove the correct key ;)
   *
   * @param alertKey The key of the alert to remove
   */
  function expireAlert(alertKey: number): void {
    setTimeout(() => {
      alerts.value = alerts.value.filter((alert) => alert.alertKey !== alertKey);
    }, 250); // 250ms timeout to not interrupt fade transition
  }

  return {
    alerts: readonly(alerts),
    displayErrorMessage,
    displayInfoMessage,
    displaySuccessMessage,
    expireAlert
  };
}
