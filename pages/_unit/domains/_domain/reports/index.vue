<template>
  <VeoPage
    :title="$t('breadcrumbs.reports')"
    fullsize
  >
    <template #header>
      <p class="mt-4">
        {{ $t('hint') }}
      </p>
    </template>
    <template #default>
      <VeoReportList
        :items="reports"
        @create-report="createReport"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { IVeoReportsMeta } from '~/types/VeoTypes';

interface IData {
  reports: IVeoReportsMeta;
}

export default Vue.extend({
  data(): IData {
    return {
      reports: {}
    };
  },
  async fetch() {
    this.reports = await this.$api.report.fetchAll();
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.reports')
    };
  },
  methods: {
    createReport(reportId: string) {
      this.$router.push(`/${this.$route.params.unit}/domains/${this.$route.params.domain}/reports/${reportId}`);
    }
  }
});
</script>

<i18n>
{
  "en": {
    "hint": "Choose the report type, for which you want to generate a report."
  },
  "de": {
    "hint": "Wählen Sie aus der Liste den Reporttyp aus, für den Sie einen Report erstellen möchten."
  }
}
</i18n>
