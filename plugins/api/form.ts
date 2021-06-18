import { Client } from '~/plugins/api';
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all Forms
     *
     * NOT PAGINATED
     *
     * @param parent
     */
    fetchAll(domain?: string, params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      if (domain) {
        if (!params) {
          params = {};
        }

        params.domainId = domain;
      }

      return api.req('/api/forms', {
        params
      });
    },

    /**
     * Creates a form
     *
     * NOT PAGINATED
     *
     * @param form
     * @returns UUID of the new form
     */
    create(form: IVeoFormSchema): Promise<string> {
      return api.req('/api/forms', {
        json: form
      });
    },

    /**
     * Loads a form by id
     *
     * NOT PAGINATED
     *
     * @param id
     */
    fetch(id: string): Promise<IVeoFormSchema> {
      return api.req(`/api/forms/${id}`);
    },

    /**
     * Updates a form
     *
     * NOT PAGINATED
     *
     * @param id
     * @param form
     */
    update(id: string, form: IVeoFormSchema): Promise<void> {
      return api.req(`/api/forms/${id}`, {
        method: 'PUT',
        json: form
      });
    },

    /**
     * Deletes a form
     *
     * NOT PAGINATED
     *
     * @param id
     */
    delete(id: string): Promise<void> {
      return api.req(`/api/forms/${id}`, {
        method: 'DELETE'
      });
    }
  };
}
