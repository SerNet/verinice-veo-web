export enum ALERT_TYPE {
  ERROR,
  INFO,
  SUCCESS,
  WARNING
}

export interface IVeoEventPayload {
  type?: ALERT_TYPE;
  text: string;
  title?: string;
  saveButtonText?: string;
}

export const VeoEvents = {
  SNACKBAR_CLOSE: 'snackbar_close',
  SNACKBAR_SUCCESS: 'snackbar_success',
  ALERT_CLOSE: 'alert_close',
  ALERT_ERROR: 'alert_error',
  ALERT_INFO: 'alert_info',
  ALERT_SUCCESS: 'alert_success',
  ALERT_WARNING: 'alert_warning',

  DOMAIN_CHANGED: 'domain_changed',
  UNIT_CREATE: 'unit-create',
  UNIT_CHANGED: 'unit_changed',

  ENTITY_UPDATED: 'entity_updated'
};
