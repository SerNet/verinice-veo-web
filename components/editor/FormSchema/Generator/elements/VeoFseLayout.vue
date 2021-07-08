<template>
  <VeoFseGroup
    v-bind="$props"
    :key="name"
    v-on="$listeners"
  >
    <slot />
  </VeoFseGroup>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { IVeoFormSchemaTranslationCollectionItem } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String,
      default: undefined
    },
    options: {
      type: Object,
      default: undefined
    },
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    level: {
      type: Number,
      default: undefined
    }
  }
});
</script>
