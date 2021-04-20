<template>
  <div :class="{'fill-width': fullsize }">
    <v-tabs v-model="activeTab">
      <slot name="tabs" />
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <slot name="items" />
    </v-tabs-items>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref
} from '@nuxtjs/composition-api'

interface IProps {
  fullsize: boolean
  startItem: number
}

export default defineComponent<IProps>({
  props: {
    fullsize: {
      type: Boolean,
      default: false
    },
    startItem: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const activeTab = ref(props.startItem)

    return { activeTab }
  }
})
</script>
