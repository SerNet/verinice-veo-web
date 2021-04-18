<template>
<VeoPage :title="title" fullsize>
  <template #header>
    <p v-if="report" class="mt-4">
      {{ report.description }}
    </p>
  </template>
  <template #default>
    <p v-if="report && report.multiselect">{{ $t('hint_multiple') }}</p>
    <p v-else-if="report">{{ $t('hint_single') }}</p>
    <VeoEntitySelection v-model="selectedEntities" :items="items" :loading="$fetchState.pending" />
  </template>
</VeoPage>
</template>

<script lang="ts">
import { upperCase } from 'lodash'
import Vue from 'vue'

import { IVeoEntity, IVeoReportsMeta } from '~/types/VeoTypes'

interface IData {
  items: IVeoEntity[]
  selectedEntities: IVeoEntity[]
  report?: {
    name: string
    description: string
    outputFormat: string,
    multiselect: boolean
  }
}

export default Vue.extend({
  head(): any {
    return {
      title: this.title
    }
  },
  data(): IData {
    return {
      items: [],
      selectedEntities: [],
      report: undefined
    }
  },
  async fetch() {
    const reports: IVeoReportsMeta = await this.$api.report.fetchAll()
    const _report = reports[this.reportId]
    const format = _report.outputTypes.map(type => {
      const formatParts = type.split('/')
      return formatParts[formatParts.length - 1]
    }).join(', ')

    if(_report) {
      this.report = {
        name: _report.name[this.$i18n.locale],
        description: _report.description[this.$i18n.locale],
        outputFormat: format,
        multiselect: _report.multipleTargetsSupported
      }

      for(let type of _report.targetTypes) {
        this.items = [...this.items, await this.$api.entity.fetchAll(type)]
      }
    }
  },
  computed: {
    title(): string {
      return this.$t('create', { type: this.report?.name || '' , format: upperCase(this.report?.outputFormat || '') })
    },
    reportId(): string {
      return this.$route.params.type
    }
  }
})
</script>

<i18n>
{
  "en": {
    "create": "Create {type} ({format})",
    "hint_multiple": "Please select the object you want to create the report for.",
    "hint_single": "Please select the object you want to create the report for."
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "hint_multiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hint_single": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten."
  }
}
</i18n>
