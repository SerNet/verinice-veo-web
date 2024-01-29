<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann, jae
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
  <div class="veo-object-icon__outer">
    <v-tooltip location="top">
      <template #activator="{ props: tooltipProps }">
        <div v-bind="tooltipProps">
          <v-icon
            v-if="icon && icon.library === 'mdi'"
            v-bind="$attrs"
            :icon="icon.icon"
          />
          <v-icon
            v-else-if="isComposite"
            class="veo-object-icon--composite"
            color="primary"
            :icon="mdiDotsHorizontal"
          />
        </div>
      </template>
      <template #default>
        {{ translatedObjectType }}
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
export const CATALOG_TYPE_ICONS = new Map<
  string,
  { icon: string | string[]; library: 'mdi' }
>([
  ['all', { icon: mdiAllInclusive, library: 'mdi' }],
  ['scope', { icon: mdiFocusField, library: 'mdi' }],
  ['process', { icon: mdiDatabaseCogOutline, library: 'mdi' }],
  ['asset', { icon: mdiDevices, library: 'mdi' }],
  ['person', { icon: mdiAccountOutline, library: 'mdi' }],
  ['incident', { icon: mdiAlarmLightOutline, library: 'mdi' }],
  ['document', { icon: mdiFileDocumentOutline, library: 'mdi' }],
  ['scenario', { icon: mdiShieldAlertOutline, library: 'mdi' }],
  ['control', { icon: mdiPlaylistCheck, library: 'mdi' }],
]);
</script>

<script lang="ts" setup>
import {
  mdiAccountOutline,
  mdiAlarmLightOutline,
  mdiDatabaseCogOutline,
  mdiDevices,
  mdiDotsHorizontal,
  mdiFileDocumentOutline,
  mdiFocusField,
  mdiPlaylistCheck,
  mdiShieldAlertOutline,
  mdiAllInclusive,
} from '@mdi/js';

import { useQuery } from '~/composables/api/utils/query';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';

const props = withDefaults(
  defineProps<{
    objectType: string;
    isComposite?: boolean;
  }>(),
  {
    isComposite: false,
  }
);

const { locale } = useI18n();
const route = useRoute();

const icon = computed(() => OBJECT_TYPE_ICONS.get(props.objectType));

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain,
}));
const { data: translations } = useQuery(
  translationQueryDefinitions.queries.fetch,
  fetchTranslationsQueryParameters
);
const translatedObjectType = computed(
  () =>
    translations.value?.lang?.[locale.value]?.[props.objectType] ||
    props.objectType
);
</script>

<style lang="scss" scoped>
.veo-object-icon__outer {
  position: relative;
  width: 27px;
}

.veo-object-icon--composite {
  bottom: -50%;
  position: absolute;
  right: 28%;
}
</style>
