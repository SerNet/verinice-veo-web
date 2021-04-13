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
    :value="expanded"
    no-action
    :prepend-icon="icon"
    active-class="veo-active-link-group"
    :sub-group="!topLevelItem"
    @input="onInputExpanded"
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
import { defineComponent, PropType, Ref, ref, watch } from '@nuxtjs/composition-api'
import { INavItem } from './VeoPrimaryNavigation.vue'

interface IProps extends INavItem {
  persistUIState: Function
  miniVariant: boolean
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
    miniVariant: {
      type: Boolean
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
    const expanded: Ref<boolean | undefined> = ref(!props.collapsed)

    watch(
      () => props.collapsed,
      (newValue: boolean | undefined) => {
        if (expanded.value !== !newValue) {
          expanded.value = !newValue
        }
      }
    )

    function emitCollapsed(newExpandedVal: boolean | undefined) {
      context.emit('update:collapsed', !newExpandedVal)
      props.persistUIState?.(!newExpandedVal)
    }

    function onInputExpanded(newExpandedVal: boolean | undefined) {
      // Set local expanded variable to new value
      expanded.value = newExpandedVal
      // Create a special behavior, when minivariant is active
      if (props.miniVariant) {
        // If new state of a list group is not expanded (false),
        // but after clicking expansion panel it should be in minivariant it should be opened
        // therefore hack it with $nextTick to force expansion
        if (!expanded.value) {
          context.root.$nextTick(() => {
            expanded.value = true
            emitCollapsed(expanded.value)
            context.emit('update-mini-variant', false)
          })
        } else {
          // If a new state of the group is expanded (true), then no need for hack
          emitCollapsed(expanded.value)
          context.emit('update-mini-variant', false)
        }
      } else {
        emitCollapsed(expanded.value)
      }
    }

    return { expanded, onInputExpanded }
  }
})
</script>
