<template>
  <VeoPage title="asdf123">
    <VeoObjectList />
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'

export default Vue.extend({
  components: {
    VeoPage,
    VeoObjectList
  }
})
</script>

<style lang="scss" scoped></style>
