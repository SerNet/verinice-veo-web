<template>
  <div>
    <v-list-item dense class="pt-1" style="height: 40px;">
      <v-list-item-content class="align-center py-3">
        <span class="pt-1 flex-grow-0" style="flex-basis: auto; width: 60px;">{{ $t('unit.select.label') }}:</span>
        <v-autocomplete
          v-if="$auth.profile"
          :items="units"
          item-text="name"
          item-value="id"
          :value="unit"
          hide-details
          dense
          class="ml-3 mt-0"
          :label="$t('unit.select.label')"
          style="max-width: 220px"
          @change="changeUnit"
        />
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-title class="d-flex justify-center">
        <v-btn color="primary" outlined @click="createUnit()">
          <v-icon>mdi-plus</v-icon> {{ $t('unit.create.short') }}
        </v-btn>
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return { units: [] }
  },
  async fetch() {
    if (this.$auth.profile) {
      this.units = await this.$api.unit.fetchAll()
      if (this.units.length === 0) {
        this.createUnit(true)
      }
    }
  },
  computed: {
    unit(): string | undefined {
      return this.$route.params.unit || '-'
    }
  },
  methods: {
    changeUnit(e: string) {
      this.$router.push('/' + e)
    },
    createUnit(persistent: boolean = false) {
      this.$root.$emit('create-unit', persistent)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
