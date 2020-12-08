<template>
  <v-list-item v-if="childItems === undefined" :to="to" :exact="exact" :disabled="disabled" active-class="veo-active-link-item">
    <v-list-item-icon v-if="icon">
      <v-icon v-text="icon" />
    </v-list-item-icon>
    <v-list-item-title>{{ name }}</v-list-item-title>
  </v-list-item>
  <v-list-group v-else :key="name" :value="extended" no-action :prepend-icon="icon" active-class="veo-active-link-group" :sub-group="!topLevelItem" @click="persistSubmenuUIState(name, extended)">
    <template #activator>
      <v-list-item-title>{{ name }}</v-list-item-title>
    </template>
    <VeoPrimaryNavigationEntry v-for="child of childItems" :key="child.name" v-bind="child" :persist-u-i-state="persistUIState" />
  </v-list-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { INavItem } from './VeoPrimaryNavigation.vue'

interface IProps extends INavItem {
  persistUIState: Function
}

export default defineComponent<IProps>({
  name: 'VeoPrimaryNavigationEntry',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: undefined
    },
    to: {
      type: String,
      default: undefined
    },
    exact: {
      type: Boolean,
      default: undefined
    },
    disabled: {
      type: Boolean,
      required: true
    },
    childItems: {
      type: Array as PropType<INavItem[]>,
      default: undefined
    },
    extended: {
      type: Boolean,
      default: true
    },
    topLevelItem: {
      type: Boolean,
      required: true
    },
    persistUIState: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    function persistSubmenuUIState(item: string, state: boolean) {
      context.emit('update:extended', state)
      if (item === 'veo.data') {
        props.persistUIState(undefined, state)
      } else if (item === 'veo.forms') {
        props.persistUIState(undefined, undefined, state)
      }
    }

    return { persistSubmenuUIState }
  }
})
</script>
<style lang="scss" scoped>

</style>
