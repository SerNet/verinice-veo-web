<template>
  <VeoWidget :title="$t('unit.details.objects')">
    <template v-if="$fetchState.pending">
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
    </template>
    <template v-else>
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
    </template>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue'
import { TranslateResult } from 'vue-i18n/types/index'

import { ObjectSchemaNames } from '~/types/FormSchema'
import VeoWidget from '~/components/widgets/VeoWidget.vue'

export default Vue.extend({
  components: {
    VeoWidget
  },
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
