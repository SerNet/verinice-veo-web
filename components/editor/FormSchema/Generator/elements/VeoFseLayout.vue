<template>
  <VeoFseGroup v-bind="$props" v-on="$listeners">
    <slot />
  </VeoFseGroup>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { IVeoFormSchemaTranslationCollectionItem } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String
    },
    options: Object,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    formSchemaPointer: String,
    level: Number
  }
})
</script>
