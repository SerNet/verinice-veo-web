<template>
  <v-card>
    <v-card-title>{{ $t('unit.details.objects') }}</v-card-title>
    <v-card-text v-if="$fetchState.pending">
      <table>
        <tr v-for="type of objects" :key="type.id">
          <td>
            <v-skeleton-loader type="text" width="150" />
          </td>
          <td class="text-right">
            <v-skeleton-loader type="text" width="10" />
          </td>
        </tr>
      </table>
    </v-card-text>
    <v-card-text v-else>
      <table>
        <tr v-for="type of objects" :key="type.id">
          <td>
            {{ type.name }}:
          </td>
          <td class="text-right">
            <nuxt-link :to="`forms/${type.id}`"><b>{{ type.items }}</b></nuxt-link>
          </td>
        </tr>
      </table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { FormSchemaMetas } from '~/types/FormSchema'

type FormsList = FormSchemaMetas & { items?: number }[]

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      objects: [] as FormsList
    }
  },
  async fetch() {
    this.objects = await this.$api.form.fetchAll({ unit: this.unit.id })
    for (const object of this.objects) {
      const objectType = object.modelType.toLowerCase()
      // @ts-ignore
      object.items = (await this.$api[objectType].fetchAll({ unit: this.unit.id })).length
    }
  }
})
</script>

<style lang="scss" scoped>
table {
  font-size: 1.2rem;
  min-width: 250px;
  border-spacing: 0 12px;

  a {
    text-decoration: none;
  }
}
</style>
