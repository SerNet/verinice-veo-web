<template>
  <div
    v-if="visible"
    class="vf-layout vf-page d-flex flex-column mx-auto"
    :class="options && options.class"
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
} from '~/components/editor/FormSchema/forms/Collection/utils/helpers.ts'

export default Vue.extend({
  name: 'Page',
  props: {
    options: Object,
    disabled: Boolean,
    visible: Boolean
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      typeof props.options !== 'undefined' && props.options.format === 'page'
    ])
  }
}
</script>
