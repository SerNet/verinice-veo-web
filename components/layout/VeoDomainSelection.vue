<template>
  <v-list-item dense class="my-2 pt-1" style="height: 40px;">
    <v-list-item-content class="align-center py-3">
      <span class="pt-1 flex-grow-0" style="flex-basis: auto; width: 60px;">{{ $t('domain.select.label') }}:</span>
      <v-select
        v-if="$auth.profile"
        item-text="name"
        item-value="id"
        hide-details
        dense
        class="ml-3 mt-0"
        style="max-width: 200px"
        :label="$t('domain.select.label')"
      />
    </v-list-item-content>
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
