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
            <nuxt-link :to="type.link"><b>{{ type.items }}</b></nuxt-link>
          </td>
        </tr>
      </table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      objects: [
        {
          title: this.$t('unit.details.objects.asset'),
          items: 0,
          link: 'data/asset'
        },
        {
          title: this.$t('unit.details.objects.control'),
          items: 0,
          link: 'data/control'
        },
        {
          title: this.$t('unit.details.objects.person'),
          items: 0,
          link: 'data/person'
        },
        {
          title: this.$t('unit.details.objects.process'),
          items: 0,
          link: 'data/process'
        }
      ]
    }
  },
  async fetch() {
    this.objects[0].items = (await this.$api.asset.fetchAll({ unit: this.unit.id })).length
    this.objects[1].items = (await this.$api.control.fetchAll({ control: this.unit.id })).length
    this.objects[2].items = (await this.$api.person.fetchAll({ person: this.unit.id })).length
    this.objects[3].items = (await this.$api.process.fetchAll({ process: this.unit.id })).length
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
