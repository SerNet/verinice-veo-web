<template>
  <div style="overflow: hidden; height: 100%; width: 100%;">
    <v-row no-gutters class="veo-page-wrapper fill-height overflow-hidden">
      <slot name="default" />
    </v-row>
    <slot name="helpers" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

interface IProps {}

export default defineComponent<IProps>({})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-page-wrapper {
  flex-wrap: nowrap;
}
</style>
