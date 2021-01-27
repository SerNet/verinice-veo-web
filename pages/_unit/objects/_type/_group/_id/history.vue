<template>
  <div>
    <h2>{{ $t('unit.objects.created') }}</h2>
    <v-row>
      <v-col>
        <v-icon>mdi-account</v-icon>
        {{ $props.updatedBy }}
      </v-col>
      <v-col>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        {{ new Date($props.updatedAt).toLocaleString() }}
      </v-col>
    </v-row>
    <v-divider />
    <h2>{{ $t('unit.objects.updated') }}</h2>
    <v-row>
      <v-col>
        <v-icon>mdi-account</v-icon>
        {{ $props.createdBy }}
      </v-col>
      <v-col>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        {{ new Date($props.createdAt).toLocaleString() }}
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    createdAt: String,
    createdBy: String,
    updatedAt: String,
    updatedBy: String
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
