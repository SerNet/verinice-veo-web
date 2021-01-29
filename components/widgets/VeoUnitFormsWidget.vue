<template>
  <VeoWidget :title="$t('unit.details.forms')">
    <template v-if="$fetchState.pending">
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
    </template>
    <template v-else>
      <table>
        <tr v-for="type of objects" :key="type.id">
          <td>{{ type.name }}:</td>
          <td class="text-right">
            <nuxt-link :to="`/${$route.params.unit}/forms/${createUUIDUrlParam('form', type.id)}`"
              ><b>{{ type.items }}</b></nuxt-link
            >
          </td>
        </tr>
      </table>
    </template>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue'

import { FormSchemaMetas } from '~/types/FormSchema'
import VeoWidget from '~/components/widgets/VeoWidget.vue'
import { endpoints } from '~/plugins/api/schema'
import { createUUIDUrlParam } from '~/lib/utils'

type FormsList = FormSchemaMetas & { items?: number }[]

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
      objects: [] as any
    }
  },
  async fetch() {
    this.objects = await this.$api.form.fetchAll({ unit: this.unit.id })
    for (const object of this.objects) {
      // @ts-ignore
      const objectType = endpoints[object.modelType.toLowerCase()]
      object.items = (
        await this.$api.object.fetchAll(objectType, {
          unit: this.unit.id
        })
      ).length
    }
  },
  methods: {
    createUUIDUrlParam
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
