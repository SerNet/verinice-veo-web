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
