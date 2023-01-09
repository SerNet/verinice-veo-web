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
    <template #activator="{ props, value }">
      <v-list
        nav
        dense
        :rounded="miniVariant"
      >
        <v-list-item
          v-show="!miniVariant"
          class="veo-domain-select"
          data-component-name="domain-select"
          :disabled="disabled"
          v-bind="props"
        >
          <v-skeleton-loader
            v-if="domainIsFetching"
            height="24px"
            style="border-radius: 999px"
            type="image"
            width="100px"
          />
          <span
            v-else
            class="veo-domain-select__selection text-no-wrap"
          >
            {{ domainName }}
          </span>
          <!--<v-icon
            v-if="value"
            end
            color="primary"
            :icon="`mdiSvg:${mdiChevronUp}`"
          />-->
          <!--<v-icon
            v-else
            end
            color="primary"
            :icon="`mdiSvg:${mdiChevronDown}`"
          />-->
        </v-list-item>
        <v-list-item
          v-show="miniVariant"
          style="height:44px;"
          v-bind="props"
          @click="$emit('expand-menu')"
        >
          <v-tooltip
            right
            :disabled="!miniVariant"
          >
            <template #activator="{ props: tooltip, attrs }">
              <div v-bind="mergeProps(attrs, tooltip)">
                <!--<v-icon
                  color="black"
                  :icon="`mdiSvg:${mdiShapeOutline}`"
                />-->
              </div>
            </template>
            <span>{{ t('domainSelection') }}</span>
          </v-tooltip>
        </v-list-item>
      </v-list>
    </template>
    <template #default>
      <v-list dense>
        <v-list-group
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
        </v-list-group>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import { mergeProps } from 'vue';
import { mdiChevronDown, mdiChevronUp, mdiShapeOutline } from '@mdi/js';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { useFetchUnitDomains } from '~/composables/api/domains';

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    miniVariant: {
      type: Boolean,
      default: false
    }
  },
  emits: ['expand-menu'],
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);

    const domainId = computed({
      get() {
        return separateUUIDParam(route.params.domain as string).id || 'more';
      },
      set(newValue: string) {
        if (newValue === 'more') {
          router.push({
            name: 'unit-domains-more',
            params: {
              ...route.params,
              domain: 'more'
            }
          });
        } else {
          router.push({
            name: 'unit-domains-domain',
            params: {
              ...route.params,
              domain: createUUIDUrlParam('domain', newValue)
            }
          });
        }
      }
    });
    const domainName = computed(() => selectItems.value.find((domain) => domain.value === domainId.value)?.text || t('noDomainSelected').toString());

    const fetchUnitDomainsQueryParameters = computed(() => ({ unitId: unitId.value }));
    const fetchUnitDomainsQueryEnabled = computed(() => !!unitId.value);
    const { data: domains, isFetching: domainIsFetching } = useFetchUnitDomains(fetchUnitDomainsQueryParameters, { enabled: fetchUnitDomainsQueryEnabled });

    const selectItems = computed(() => domains.value.map((domain) => ({ value: domain.id, text: domain.name })).concat({ value: 'more', text: t('breadcrumbs.more').toString() }));

    return {
      domainId,
      domainIsFetching,
      domainName,
      selectItems,

      mergeProps,
      t,
      mdiChevronDown,
      mdiChevronUp,
      mdiShapeOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noDomainSelected": "No module selected",
    "domainSelection": "Domain selection"
  },
  "de": {
    "noDomainSelected": "Kein Modul ausgewählt",
    "domainSelection": "Modulauswahl"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-domain-select {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.veo-domain-select.v-list-item--disabled {
  background: rgba(0, 0, 0, 0.16);
}

.veo-domain-select__selection {
  color: #666666;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
