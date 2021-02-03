import { Client } from '~/plugins/api'
import { IVeoTranslations } from '~/types/VeoTypes'

type Languages = 'de' | 'en' | 'cs' | 'it'

export default function(api: Client) {
  return {
    /**
     * Retrieves a map of UI translation key-value pairs.
     */
    fetch(languages: Languages[]): Promise<IVeoTranslations> {
      return api.req(`/api/translations?languages=${encodeURIComponent(languages.toString())}`)
    }
  }
}
