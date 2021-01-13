<template>
  <v-list-item
    v-if="childItems === undefined"
    :to="to"
    :exact="exact"
    :disabled="disabled"
    active-class="veo-active-link-item"
  >
    <v-list-item-icon v-if="icon">
      <v-icon v-text="icon" />
    </v-list-item-icon>
    <v-list-item-title>{{ name }}</v-list-item-title>
  </v-list-item>
  <v-list-group
    v-else
    :key="name"
    :value="!collapsed"
    no-action
    :prepend-icon="icon"
    active-class="veo-active-link-group"
    :sub-group="!topLevelItem"
    @input="setCollapsedState(name, !$event)"
  >
    <template #activator>
      <v-list-item-title>{{ name }}</v-list-item-title>
    </template>
    <VeoPrimaryNavigationEntry
      v-for="child of childItems"
      :key="child.name"
      v-bind="child"
      :persist-u-i-state="child.persistCollapsedState"
    />
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
    collapsed: {
      type: Boolean,
      default: false
    },
    topLevelItem: {
      type: Boolean,
      required: true
    },
    persistUIState: {
      type: Function
    }
  },
  setup(props, context) {
    function setCollapsedState(item: string, collapsed: boolean) {
      context.emit('update:collapsed', collapsed)

      props.persistUIState?.(collapsed)
    }

    return { setCollapsedState }
  }
})
</script>
<style lang="scss" scoped>
</style>
