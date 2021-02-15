<template>
  <VeoPage title="veo.Scopes">
    <template #default>
      <VeoObjectList title="asdf" @create-scope="showCreateScope()" />
    </template>
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent, ref, useContext } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage,
    VeoObjectList
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
