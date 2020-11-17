<template>
  <v-card>
    <v-card-title>{{ $t('unit.details.objects') }}</v-card-title>
    <v-card-text v-if="$fetchState.pending">
      <table>
        <tr v-for="type of objects" :key="type.title">
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
        <tr v-for="type of objects" :key="type.title">
          <td>
            {{ type.title }}:
          </td>
          <td class="text-right">
            <nuxt-link :to="`/${$route.params.unit}/${type.link}`"><b>{{ type.items }}</b></nuxt-link>
          </td>
        </tr>
      </table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { TranslateResult } from 'vue-i18n/types/index'

import { ObjectSchemaNames } from '~/types/FormSchema'

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      objects: [] as { title: TranslateResult, link: string, items: number }[]
    }
  },
  async fetch() {
    const keys = Object.keys(ObjectSchemaNames)
    for await (const key of keys) {
      this.objects.push({
        title: this.$t(`unit.data.type.${key}`),
        link: `data/${key}`,
        // @ts-ignore
        items: (await this.$api[key].fetchAll({ unit: this.unit.id })).length
      })
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
