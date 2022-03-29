<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Annemarie Bufe
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-menu
    offset-y
    bottom
  >
    <template #activator="{ on, value }">
      <v-list-item
        style="margin: -4px 0; height: calc(100% + 8px)"
        v-on="on"
      >
        <v-skeleton-loader
          v-if="$fetchState.pending"
          height="24px"
          style="border-radius: 999px"
          type="image"
          width="100px"
        />
        <span
          v-else
          class="veo-domain-select__selection"
        >
          {{ domainName }}
        </span>
        <v-icon
          v-if="value"
          right
          large
          color="primary"
        >
          {{ mdiChevronUp }}
        </v-icon>
        <v-icon
          v-else
          right
          large
          color="primary"
        >
          {{ mdiChevronDown }}
        </v-icon>
      </v-list-item>
    </template>
    <template #default>
      <v-list dense>
        <v-list-item-group
          :value="domainId"
          color="primary"
        >
          <v-list-item
            v-for="domain of selectItems"
            :key="domain.value"
            :value="domain.value"
            @click="domainId = domain.value"
          >
            <v-list-item-title>{{ domain.text }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, useRouter, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const unitId = computed(() => separateUUIDParam(route.value.params.unit).id);

    const domainId = computed({
      get() {
        return separateUUIDParam(route.value.params.domain).id || 'more';
      },
      set(newValue: string) {
        if (newValue === 'more') {
          router.push({
            name: 'unit-domains-more',
            params: {
              ...route.value.params,
              domain: 'more'
            }
          });
        } else {
          router.push({
            name: 'unit-domains-domain',
            params: {
              ...route.value.params,
              domain: createUUIDUrlParam('domain', newValue)
            }
          });
        }
      }
    });
    const domainName = computed(() => selectItems.value.find((domain) => domain.value === domainId.value)?.text || t('noDomainSelected').toString());

    const domains = ref<IVeoDomain[]>([]);
    const { fetch } = useFetch(async () => {
      domains.value = await $api.domain.fetchUnitDomains(unitId.value);
    });

    const selectItems = computed(() => {
      const items = domains.value.map((domain) => ({ value: domain.id, text: domain.name }));

      items.push({ value: 'more', text: t('breadcrumbs.more_modules').toString() });

      return items;
    });

    watch(
      () => unitId.value,
      () => fetch()
    );

    return {
      domainId,
      domainName,
      selectItems,

      t,
      mdiChevronDown,
      mdiChevronUp
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noDomainSelected": "No module selected"
  },
  "de": {
    "noDomainSelected": "Kein Modul ausgewählt"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-domain-select {
  border-radius: 4px;
  overflow: hidden;
  width: 175px;
}

.veo-domain-select__selection {
  color: #666666;
  font-size: 1.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
