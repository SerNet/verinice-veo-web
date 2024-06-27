/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
const localeImports: Record<string, () => Promise<any>> = {
  de: () => import('~/locales/de.json'),
  en: () => import('~/locales/en.json'),
  'ITGS/de': () => import('~/locales/ITGS/de.json'),
  'ITGS/en': () => import('~/locales/ITGS/en.json')
};

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute();
  const { authenticated } = useVeoUser();
  const $i18n = nuxtApp.$i18n as any;

  const loadLocaleMessages = async (locale: string) => {
    if (localeImports[locale]) {
      try {
        const messages = await localeImports[locale]!();
        return messages.default || messages;
      } catch (e) {
        console.error(`Failed to load messages for locale: ${locale}`, e);
      }
    } else {
      console.warn(`No import found for locale: ${locale}`);
      return {};
    }
  };

  const setLocaleMessages = async (locale: string) => {
    const baseMessages = await loadLocaleMessages(locale);
    let domainMessages;

    if (authenticated.value) {
      const { domains } = useDomains();
      watch(
        () => domains.value,
        async (newVal) => {
          if (newVal && newVal.length > 0) {
            if (route.params.domain) {
              const domain = newVal.find((domain) => domain.id === route.params.domain)?.abbreviation;
              if (domain !== 'ITGS') {
                $i18n.setLocaleMessage(locale, baseMessages);
              } else {
                domainMessages = await loadLocaleMessages(
                  `${newVal.find((domain) => domain.id === route.params.domain)?.abbreviation}/${locale}`
                );

                const messages = {
                  ...baseMessages,
                  itgs: domainMessages
                };
                $i18n.setLocaleMessage(locale, messages);
              }
            }
          }
        },
        { immediate: true }
      );
    } else {
      $i18n.setLocaleMessage(locale, baseMessages);
    }
  };

  const initialLocale = $i18n.locale.value;
  await setLocaleMessages(initialLocale);

  watch(
    () => route.params.domain,
    async () => {
      await setLocaleMessages($i18n.locale.value);
    }
  );
  watch(
    () => $i18n.locale.value,
    async (newLocale) => {
      await setLocaleMessages(newLocale);
    }
  );
});
