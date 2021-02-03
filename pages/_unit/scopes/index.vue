<template>
  <VeoPage title="veo.Scopes">
    <template #default>
      <VeoHierarchicalTable title="asdf" />
    </template>
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoHierarchicalTable from '~/components/scopes/VeoHierarchicalTable.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage,
    VeoHierarchicalTable
  },
  setup() {},
  head() {
    return {
      title: 'veo.Scopes'
    }
  }
})
</script>
<style lang="scss" scoped></style>
