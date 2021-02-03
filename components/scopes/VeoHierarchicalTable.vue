<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="20"
    no-data-text="no data"
    loading-text="loading"
    :loading="false"
  >
    <template #top>
      <div class="d-flex justify-between">
        <h3>{{ title }}</h3>
        <v-spacer />
        <VeoMenuButton button-text="Scope erstellen" :menu-items="menuItems" />
      </div>
    </template>
  </v-data-table>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, ref } from '@nuxtjs/composition-api'

import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'

interface IProps {
  title: String
  items: any[]
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  components: {
    VeoMenuButton
  },
  setup(_props, _context) {
    const headers = ref([])

    const menuItems: ComputedRef<IVeoMenuButtonItem[]> = computed(() => {
      return [
        {
          disabled: false,
          eventName: 'create-scope',
          name: 'Scope erstellen'
        },
        {
          disabled: true,
          eventName: 'create-group',
          name: 'Group erstellen'
        },
        {
          disabled: false,
          eventName: 'create-object',
          name: 'Object erstellen'
        }
      ]
    })

    return {
      headers,
      menuItems
    }
  }
})
</script>
