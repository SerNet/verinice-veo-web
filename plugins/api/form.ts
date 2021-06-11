import { Client } from '~/plugins/api';
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all Forms
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      return api.req('/api/forms', {
        params
      });
    },

    /**
     * Loads all Forms REGARDLESS of domain
     * @param parent
     */
    fetchGlobal(params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      return api.req('/api/forms', {
        params
      });
    },

    /**
     * Creates a form
     * @param form
     *
     * @returns UUID of the new form
     */
    create(form: IVeoFormSchema): Promise<string> {
      return api.req('/api/forms', {
        json: form
      });
    },

    /**
     * Loads a forml by id
     * @param id
     */
    fetch(id: string): Promise<IVeoFormSchema> {
      return api.req(`/api/forms/${id}`);
    },

    /**
     * Updates a form
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
     * @param id
     */
    delete(id: string): Promise<void> {
      return api.req(`/api/forms/${id}`, {
        method: 'DELETE'
      });
    }
  };
}
