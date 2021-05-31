<template>
  <VeoPage :title="title" fullsize>
    <template #header>
      <v-row class="justify-space-between">
        <v-col cols="auto">
          <p v-if="report" class="mt-4">{{ report.description }}</p>
        </v-col>
        <v-col cols="auto">
          <v-btn
            outlined
            color="primary"
            class="mt-4"
            :disabled="loading || !selectedEntities.length"
            @click="generateReport"
          >{{ $t('generateReport') }}</v-btn>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoLoadingWrapper v-if="generatingReport" />
      <p v-if="report && report.multiselect">{{ $t('hintMultiple') }}</p>
      <p v-else-if="report">{{ $t('hintSingle') }}</p>
      <VeoEntitySelectionList
        :selected-items="selectedEntities"
        :items="items"
        :loading="$fetchState.pending"
        single-select
        @new-subentities="onNewSubEntities"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { upperCase } from 'lodash'
import Vue from 'vue'

import { IVeoCreateReportData, IVeoEntity, IVeoReportsMeta } from '~/types/VeoTypes'

interface IData {
  items: IVeoEntity[]
  selectedEntities: { id: string; type: string }[]
  report?: {
    name: string
    description: string
    outputFormat: string
    outputType: string
    multiselect: boolean
  }
  generatingReport: boolean
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
      report: undefined,
      generatingReport: false
    }
  },
  async fetch() {
    const reports: IVeoReportsMeta = await this.$api.report.fetchAll()
    const _report = reports[this.reportId]
    const format = _report.outputTypes
      .map(type => {
        const formatParts = type.split('/')
        return formatParts[formatParts.length - 1]
      })
      .join(', ')

    if (_report) {
      this.report = {
        name: _report.name[this.$i18n.locale],
        description: _report.description[this.$i18n.locale],
        outputFormat: format,
        outputType: _report.outputTypes[0],
        multiselect: _report.multipleTargetsSupported
      }

      for await (let type of _report.targetTypes) {
        this.items = [...this.items, ...(await this.$api.entity.fetchAll(type))]
      }
    }
  },
  computed: {
    title(): string {
      return this.$t('create', { type: this.report?.name || '', format: upperCase(this.report?.outputFormat || '') })
    },
    reportId(): string {
      return this.$route.params.type
    },
    loading(): boolean {
      return this.$fetchState.pending || this.generatingReport
    }
  },
  methods: {
    async generateReport() {
      this.generatingReport = true
      if (this.report) {
        const body: IVeoCreateReportData = {
          outputType: this.report.outputType,
          targets: this.selectedEntities
        }
        const result = new Blob([await this.$api.report.create(this.reportId, body)], { type: 'application/pdf' })
        window.open(URL.createObjectURL(result))
      }
      this.generatingReport = false
    },
    onNewSubEntities(items: { type: string; id: string }[]) {
      this.selectedEntities = items
    }
  }
})
</script>

<i18n>
{
  "en": {
    "create": "Create {type} ({format})",
    "generateReport": "Generate report",
    "hintMultiple": "Please select the object you want to create the report for.",
    "hintSingle": "Please select the object you want to create the report for."
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "generateReport": "Report generieren",
    "hintMultiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hintSingle": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten."
  }
}
</i18n>
