<template>
  <VeoPage :title="$t('breadcrumbs.reports')" fullsize>
    <template #default>
      <p class="mt-4">{{ $t('hint') }}</p>
      <VeoReportList :items="reports" @create-report="createReport" />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import { IVeoReportsMeta } from '~/types/VeoTypes'

interface IData {
  reports: IVeoReportsMeta
}

export default Vue.extend({
  data(): IData {
    return {
      reports: {}
    }
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.reports')
    }
  },
  async fetch() {
    this.reports = await this.$api.report.fetchAll()
  },
  methods: {
    createReport(reportId: string) {
      const report = `report-${reportId}`
      this.$router.push(`/${this.$route.params.unit}/reports/${report}`)
    }
  }
})
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
