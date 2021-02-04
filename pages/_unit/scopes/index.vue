<template>
  <VeoPage title="veo.Scopes">
    <template #default>
      <VeoHierarchicalTable title="asdf" @create-scope="showCreateScope()" />
      <VeoCreateScopeDialog v-model="createScopeDialog" @created="scopeCreated" />
    </template>
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent, ref, useContext } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoHierarchicalTable from '~/components/scopes/VeoHierarchicalTable.vue'
import VeoCreateScopeDialog from '~/components/scopes/VeoCreateScopeDialog.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage,
    VeoHierarchicalTable,
    VeoCreateScopeDialog
  },
  setup(_props, _context) {
    const { $api } = useContext()

    /**
     * Dialogs
     */
    const createScopeDialog = ref(false)

    function showCreateScope() {
      createScopeDialog.value = true
    }

    function scopeCreated() {
      console.log('Bla')
    }

    return {
      createScopeDialog,
      showCreateScope,
      scopeCreated
    }
  },
  head() {
    return {
      title: 'veo.Scopes'
    }
  }
})
</script>
<style lang="scss" scoped></style>
