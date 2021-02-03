<template>
  <div class="fill-width fill-height d-flex flex-column overflow-hidden">
    <!-- Encapsulate header in div as to not interfere with the pages -->
    <div :class="titleClass">
      <h1 v-if="title" class="d-inline px-4 py-1 flex-grow-0">
        {{ title }}
      </h1>
      <slot name="title" />
      <slot name="header" />
    </div>
    <v-row no-gutters class="veo-page-wrapper overflow-hidden">
      <slot name="default" />
    </v-row>
    <slot name="helpers" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

interface IProps {
  title: String
  titleClass: String
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-page-wrapper {
  flex-wrap: nowrap;
}
</style>
