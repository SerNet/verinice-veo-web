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
import { readonly, ref, Ref, SetupContext } from '@nuxtjs/composition-api';

import { VeoAlertType } from '~/components/layout/VeoAlert.vue';
import { IVeoGlobalAlert, IVeoGlobalAlertParams } from '~/components/layout/VeoGlobalAlert.vue';
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';

const alerts: Ref<IVeoGlobalAlert[]> = ref([]);

export function useVeoAlerts() {
  /**
   * Displays an error message consisting of a title, text and button.
   *
   * @param title Title of the error message
   * @param text Text of the error message
   * @param params Text of the button. If set to undefined, "Okay" will be used
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displayErrorMessage(title: string, text: string, params?: IVeoGlobalAlertParams): number {
    const alertKey = Date.now();
    alerts.value.push({
      type: VeoAlertType.ERROR,
      title,
      text,
      params,
      alertKey: Date.now()
    });
    return alertKey;
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
    const alertKey = Date.now();
    alerts.value.push({
      type: VeoAlertType.INFO,
      title,
      text,
      params,
      alertKey
    });
    return alertKey;
  }

  /**
   * Displays a simple success message
   *
   * @param text Text to display
   * @returns Key of the alert. Can be used to call expireAlert programmatically
   */
  function displaySuccessMessage(text: string): number {
    const alertKey = Date.now();
    alerts.value.push({
      type: VeoAlertType.SUCCESS,
      text,
      alertKey: Date.now()
    });
    return alertKey;
  }

  /**
   * Expire an alert. Usually gets called under the hood by VeoGlobalAlert if the timeout is reached or the close button is clicked.
   * However you can call it yourself if you programmatically want to close an alert. Just make sure to remove the correct key ;)
   *
   * @param alertKey The key of the alert to remove
   */
  function expireAlert(alertKey: number): void {
    setTimeout(() => {
      const index = alerts.value.findIndex((alert) => alert.alertKey === alertKey);
      if (index > -1) {
        alerts.value.splice(index, 1);
      }
    }, 250);
  }

  /**
   * Calls a callback passed by the component creating the alert upon firing an event hardcoded in the VeoGlobalAlert.vue
   *
   * @param event The name of the event to search for and to call
   */
  function dispatchEventForCurrentAlert(event: string) {
    if (alerts.value[0].params?.eventCallbacks?.[event]) {
      alerts.value[0].params.eventCallbacks[event]();
    }
  }

  /**
   * Provides the old way of displaying errors by calling this.$root.$emit.
   * NOTE: ONLY USE IN NON-COMPOSITION-API COMPONENTS
   *
   * @param root The root context of the nuxt application
   */
  function listenToRootEvents(root: SetupContext['root']): void {
    root.$on(VeoEvents.ALERT_ERROR, (payload: IVeoEventPayload) => {
      displayErrorMessage(payload.title as string, payload.text, {
        buttonText: payload.saveButtonText,
        objectModified: payload.objectModified,
        eventCallbacks: {
          refetch: payload.refetchCallback as CallableFunction
        }
      });
    });
    root.$on(VeoEvents.ALERT_INFO, (payload: IVeoEventPayload) => {
      displayInfoMessage(payload.title as string, payload.text, {
        buttonText: payload.saveButtonText,
        objectModified: payload.objectModified,
        eventCallbacks: {
          refetch: payload.refetchCallback as CallableFunction
        }
      });
    });
    root.$on(VeoEvents.SNACKBAR_SUCCESS, (payload: IVeoEventPayload) => {
      displaySuccessMessage(payload.text);
    });
    root.$on(VeoEvents.ALERT_EXPIRE, (alertKey: number) => {
      expireAlert(alertKey);
    });
  }

  return {
    alerts: readonly(alerts),
    dispatchEventForCurrentAlert,
    displayErrorMessage,
    displayInfoMessage,
    displaySuccessMessage,
    expireAlert,
    listenToRootEvents
  };
}
