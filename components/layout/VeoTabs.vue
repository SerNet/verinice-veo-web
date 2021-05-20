<template>
  <div :class="{'fill-width': fullsize, 'veo-tab-sticky': stickyTabs }">
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
    },
    stickyTabs: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const activeTab = ref(props.startItem)

    return { activeTab }
  }
})
</script>

<style lang="scss" scoped>
.veo-tab-sticky {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.v-tabs {
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
