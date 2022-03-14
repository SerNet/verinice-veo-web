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
  <v-select
    v-model="domainId"
    class="veo-domain-select"
    color="primary"
    dense
    hide-details
    :items="selectItems"
    outlined
    :placeholder="t('noDomainSelected')"
    style="width: 175px;"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, useRouter, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

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
      selectItems,

      t
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
@import '~/assets/vuetify.scss';

::v-deep.veo-domain-select fieldset,
::v-deep.veo-domain-select .v-select__selection,
::v-deep.veo-domain-select i {
  color: $primary !important;
}
</style>