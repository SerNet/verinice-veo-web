<template>
  <VeoPage title="veo.Scopes">
    <template #default>
      asdf
    </template>
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage
  },
  setup() {},
  head() {
    return {
      title: 'veo.Objects'
    }
  }
})
</script>
<style lang="scss" scoped></style>
