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
import { IVeoFormSchemaMeta } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      forms: [] as IVeoFormSchemaMeta[],
      processStatus: {} as { [key: string]: { text: string; color: string; items: number } }
    };
  },
  async fetch() {
    this.forms = await this.$api.form.fetchAll(separateUUIDParam(this.$route.params.domain).id);
    for (const status in this.processStatus) {
      this.processStatus[status].items = (
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
    }
  },
  created() {
    this.processStatus = {
      NEW: { text: this.$t('status.new').toString(), color: '#AD2828', items: 0 },
      IN_PROGRESS: { text: this.$t('status.inProgress').toString(), color: '#c90000', items: 0 },
      FOR_REVIEW: { text: this.$t('status.forReview').toString(), color: '#E2BF00', items: 0 },
      RELEASED: { text: this.$t('status.released').toString(), color: '#41A011', items: 0 },
      ARCHIVED: { text: this.$t('status.archived').toString(), color: '#656565', items: 0 }
    };
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<i18n>
{
  "en": {
    "dataProcessing": "Data processing",
    "status": {
      "new": "New",
      "inProgress": "In progress",
      "forReview": "For review",
      "released": "Released",
      "archived": "Archived"
    }
  },
  "de": {
    "dataProcessing": "Verarbeitungstätigkeiten",
    "status": {
      "new": "Neu",
      "inProgress": "In Bearbeitung",
      "forReview": "Zur Prüfung",
      "released": "Freigegeben",
      "archived": "Archiviert"
    }
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
