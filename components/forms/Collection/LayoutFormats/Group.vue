<template>
  <div
    v-if="visible"
    class="vf-layout vf-group d-flex mx-auto"
    :class="dynamicClasses"
    style="max-width: 800px; width: 100%;"
    :style="options && options.style"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  Helpful,
  LayoutProps
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'Group',
  props: {
    options: Object,
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    directionClass(): string {
      if (
        this.options &&
        this.options.direction &&
        this.options.direction === 'horizontal'
      ) {
        return 'flex-row'
      } else {
        return 'flex-column'
      }
    },
    dynamicClasses(): string[] {
      return [
        this.directionClass,
        this.options && this.options.class ? this.options.class : ''
      ]
    }
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [
        typeof props.options !== 'undefined' &&
          props.options.format === 'group'
      ],
      Number.EPSILON
    )
  }
}
</script>
