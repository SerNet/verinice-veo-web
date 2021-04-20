<template>
<div />
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    object: Object as Prop<IVeoEntity>
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
