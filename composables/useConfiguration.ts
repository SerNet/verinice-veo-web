/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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
import { config as baseConfig } from '~/configuration/base/config';
import { words } from 'lodash';

export function customKebabCase(str) {
  return words(str, /[a-z0-9+]+/gi)
    .join('-')
    .toLowerCase();
}

interface IVeoConfiguration {
  readonly riskAffectedObjectTypes: string[];
  readonly objectDetails?: {
    readonly hasRisks: string[];
  };
  readonly domains?: {
    readonly colors: Record<string, string>;
  };
  readonly riEditor?: {
    readonly renderedProperties: {
      readonly targetObject: ReadonlyArray<{
        readonly label: string;
        readonly key: string;
      }>;
      readonly control: ReadonlyArray<{
        readonly label: string;
        readonly key: string;
      }>;
    };
  };
}

export function useConfiguration() {
  const data = ref<IVeoConfiguration>();
  const isLoading = ref(true);
  const runtimeConfig = useRuntimeConfig();

  const { data: currentDomain } = useCurrentDomain();
  watch(currentDomain, () => setConfig(), { immediate: true });

  async function setConfig() {
    if (!currentDomain.value?.name) return (data.value = { ...baseConfig });
    isLoading.value = true;

    try {
      const domainName = customKebabCase(currentDomain.value.name);
      const domainSpecificConfig = await getDomainSpecificConfig(domainName);
      data.value = { ...baseConfig, ...domainSpecificConfig.config };
    } catch (e) {
      if (runtimeConfig.public.debug) console.info('Could not set configuration:', e);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    isLoading
  };
}

async function getDomainSpecificConfig(domainName: string) {
  const runtimeConfig = useRuntimeConfig();
  if (!domainName) return;

  try {
    return await import(`~/configuration/${domainName}/config.ts`);
  } catch (e) {
    if (runtimeConfig.public.debug) console.info('Could not load domain specific config:', e);
    return {};
  }
}
