<template>
  <v-list-item style="height: 56px;">
    <v-list-item-icon>
      {{ $t('domain.select.label') }}:
    </v-list-item-icon>
    <v-list-item-title>
      <v-select
        v-if="$auth.profile"
        item-text="name"
        item-value="id"
        hide-details
        dense
        class="mt-0"
        :label="$t('domain.select.label')"
      />
    </v-list-item-title>
    <v-list-item-action class="ml-0" />
  </v-list-item>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
})
</script>

<style lang="scss" scoped>
</style>
