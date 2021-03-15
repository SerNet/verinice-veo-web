<template>
  <FseGroup v-bind="$props" v-on="$listeners">
    <slot />
  </FseGroup>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { IVEOFormSchemaTranslationCollectionItem } from 'veo-formschema'

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
    } as PropOptions<IVEOFormSchemaTranslationCollectionItem>,
    formSchemaPointer: String,
    level: Number
  }
})
</script>
