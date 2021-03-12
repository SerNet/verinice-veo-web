<template>
  <VeoObjectHistory :object="object" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoObjectHistory from '~/components/objects/VeoObjectHistory.vue'
import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  components: {
    VeoObjectHistory
  },
  props: {
    object: Object as Prop<IVeoEntity>
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
