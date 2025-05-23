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

export default defineNuxtPlugin(async (nuxtApp) => {
  const { authenticated } = useVeoUser();
  const { data: currentDomain } = useCurrentDomain();
  const $i18n = nuxtApp.$i18n as any;
  async function importMessages(locale: string, domain: string = 'base') {
    try {
      return await import(`~/locales/${domain}/${locale}.json`);
    } catch (_e: any) {
      return { default: {} };
    }
  }
  async function setMessages(locale: string, isAuthenticated: boolean, domainName: string | undefined) {
    try {
      const baseMessages = await importMessages(locale);
      if (!isAuthenticated || !domainName) {
        $i18n.setLocaleMessage(locale, baseMessages.default);
        return;
      }

      const domainMessages = await importMessages(locale, domainName);
      const messages = {
        ...baseMessages.default,
        ...domainMessages.default
      };
      $i18n.setLocaleMessage(locale, messages);
    } catch (error) {
      console.error(error);
    }
  }

  watch(
    () => [currentDomain.value, $i18n.locale.value, authenticated.value],
    async () => {
      if (!currentDomain.value?.name) return;
      const domainName = currentDomain.value.name.replace(/[^a-zA-Z\d]/g, '-').toLowerCase();
      await setMessages($i18n.locale?.value, authenticated.value, domainName);
    },
    { immediate: true }
  );
});
