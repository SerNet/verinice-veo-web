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
          <td>{{ type.title }}:</td>
          <td class="text-right">
            <nuxt-link :to="`/${$route.params.unit}/${type.link}`">
              <b>{{ type.items }}</b>
            </nuxt-link>
          </td>
        </tr>
      </table>
    </template>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue'
import { TranslateResult } from 'vue-i18n/types/index'

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
      objects: [] as { title: TranslateResult; link: string; items: number }[]
    }
  },
  async fetch() {
    this.$api.schema.fetch('asset').then(data => {
      console.log('1', data)
    })
    this.$api.translation.fetch(['de']).then(data => {
      console.log('2', data)
    })
    await this.$api.schema
      .fetchAll()
      .then(data => {
        console.log(data)
        return data.knownSchemas.map(async (key: string) => {
          return {
            title: this.$t(`unit.data.type.${key}`),
            link: `data/${key}`,
            // @ts-ignore
            items: (
              await this.$api.object.fetchAll(`${key}s`, { unit: this.unit.id })
            ).length
          }
        })
      })
      .then(types => {
        Promise.all(types).then(data => {
          this.objects = data as any
        })
      })
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
