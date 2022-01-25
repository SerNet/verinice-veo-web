<!--
   - verinice.veo web
   - Copyright (C) 2022 Jessica Lühnen
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
  <v-container
    v-bind="$attrs"
    class="pa-0"
    v-on="$listeners"
  >
    <v-row no-gutters>
      <v-col>
        <p class="text-no-wrap mb-0">
          <strong>{{ amountCustomAspects }}</strong>
          {{ upperFirst(t('customAspects').toString()) }}
        </p>
        <p class="text-no-wrap mb-0">
          <strong>{{ amountCustomLinks }}</strong>
          {{ upperFirst(t('customLinks').toString()) }}
        </p>
      </v-col>
      <v-col>
        <p
          v-if="object"
          class="text-xl-right text-no-wrap mb-0"
        >
          <strong>{{ upperFirst(t('updatedAt').toString()) }}:</strong>
          {{ formatDateTime(object.updatedAt) }} {{ t('by') }} {{ object.updatedBy }}
        </p>
        <p
          v-if="object"
          class="text-xl-right text-no-wrap mb-0"
        >
          <strong>{{ upperFirst(t('createdAt').toString()) }}:</strong>
          {{ formatDateTime(object.createdAt) }} {{ t('by') }} {{ object.createdBy }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>{{ object && object.description }}</v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, PropOptions, computed } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { IVeoEntity } from '~/types/VeoTypes';
import { formatDate, formatTime } from '~/lib/utils';

export default defineComponent({
  name: 'VeoObjectDetailsInformation',
  props: {
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>
  },
  setup(props) {
    const { t } = useI18n();

    // get amount of custom aspects and custom links
    const amountCustomAspects = computed(() => Object.keys(props.object?.customAspects || {}).length);
    const amountCustomLinks = computed(() => Object.keys(props.object?.links || {}).length);

    // format date time to show updated at & created at
    const formatDateTime = (date: string) => formatDate(new Date(date)) + ' ' + formatTime(new Date(date));

    return {
      amountCustomAspects,
      amountCustomLinks,
      formatDateTime,
      upperFirst,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "customAspects": "custom aspects",
    "customLinks": "custom links",
    "updatedAt": "last change",
    "createdAt": "created",
    "by": "by"
  },
  "de": {
    "customAspects": "Custom Aspects",
    "customLinks": "Custom Links",
    "updatedAt": "letzte Änderung",
    "createdAt": "erstellt",
    "by": "von"
  }
}
</i18n>
