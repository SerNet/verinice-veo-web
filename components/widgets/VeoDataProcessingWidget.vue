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
  <VeoWidget :title="$t('dataProcessing')">
    <v-simple-table dense>
      <tbody>
        <tr
          v-for="(status, key) in processStatus"
          :key="key"
          :style="{ color: status.color }"
        >
          <td>{{ status.text }}</td>
          <td
            v-if="$fetchState.pending"
            class="text-right"
          >
            <v-skeleton-loader
              type="text"
              width="10"
            />
          </td>
          <td
            v-else
            class="text-right"
          >
            <nuxt-link
              :to="`/${$route.params.unit}/domains/${$route.params.domain}/forms/${createUUIDUrlParam('form', dataProcessingFormId)}?filter=status&value=${key}`"
            >
              <b>{{ status.items }}</b>
            </nuxt-link>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoFormSchemaMeta, IVeoTranslations } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      forms: [] as IVeoFormSchemaMeta[],
      translations: { lang: {} } as IVeoTranslations,
      itemCountPerStatus: {
        NEW: 0,
        IN_PROGRESS: 0,
        FOR_REVIEW: 0,
        RELEASED: 0,
        ARCHIVED: 0
      } as { [key: string]: number }
    };
  },
  async fetch() {
    this.translations = await this.$api.translation.fetch(this.$i18n.locales as any);
    this.forms = await this.$api.form.fetchAll(separateUUIDParam(this.$route.params.domain).id);
    for (const status in this.itemCountPerStatus) {
      this.itemCountPerStatus[status] = (
        await this.$api.entity.fetchAll('process', 0, {
          size: 1,
          subType: 'PRO_DataProcessing',
          status
        })
      ).totalItemCount;
    }
  },
  computed: {
    dataProcessingFormId(): string {
      return this.forms.find((form) => form.subType === 'PRO_DataProcessing')?.id || '';
    },
    processStatus(): { [key: string]: { text: string; color: string; items: number } } {
      return {
        NEW: { text: this.translations.lang?.[this.$i18n.locale]?.process_status_NEW || 'NEW', color: '#AD2828', items: 0 },
        IN_PROGRESS: { text: this.translations.lang?.[this.$i18n.locale]?.process_status_IN_PROGRESS || 'IN_PROGRESS', color: '#c90000', items: 0 },
        FOR_REVIEW: { text: this.translations.lang?.[this.$i18n.locale]?.process_status_FOR_REVIEW || 'FOR_REVIEW', color: '#E2BF00', items: 0 },
        RELEASED: { text: this.translations.lang?.[this.$i18n.locale]?.process_status_RELEASED || 'RELEASED', color: '#41A011', items: 0 },
        ARCHIVED: { text: this.translations.lang?.[this.$i18n.locale]?.process_status_ARCHIVED || 'ARCHIVED', color: '#656565', items: 0 }
      };
    }
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<i18n>
{
  "en": {
    "dataProcessing": "Data processing"
  },
  "de": {
    "dataProcessing": "Verarbeitungstätigkeiten"
  }
}
</i18n>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }
}
</style>
