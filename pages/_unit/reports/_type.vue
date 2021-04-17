<template>
<VeoPage :title="title" fullsize>
  <template #default>
    <VeoEntitySelection v-model="selectedEntities" :items="items" :loading="$fetchState.pending" />
  </template>
</VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'
import { separateUUIDParam } from '~/lib/utils'

import { IVeoEntity, IVeoReportMeta } from '~/types/VeoTypes'

interface IData {
  items: IVeoEntity[]
  selectedEntities: IVeoEntity[]
  report?: IVeoReportMeta
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
    const reports = await this.$api.report.fetchAll()
    console.log(reports, this.reportId)
    this.report = reports[this.reportId]
    console.log(this.report)
  },
  computed: {
    title(): string {
      return 'asdf'
    },
    reportId(): string {
      return separateUUIDParam(this.$route.params.type).id
    }
  }
})
</script>
