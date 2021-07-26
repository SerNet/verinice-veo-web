<template>
  <VeoWidget :title="$t('unit.details.objects')">
    <v-simple-table dense>
      <tbody v-if="$fetchState.pending">
        <tr
          v-for="index in 7"
          :key="index"
        >
          <td>
            <v-skeleton-loader
              type="text"
              width="150"
            />
          </td>
          <td class="text-right">
            <v-skeleton-loader
              type="text"
              width="10"
            />
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          v-for="type of objects"
          :key="type.title"
        >
          <td>{{ type.title }}</td>
          <td class="text-right">
            <nuxt-link :to="`/${$route.params.unit}/${type.link}`">
              <b>{{ type.items }}</b>
            </nuxt-link>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </VeoWidget>
</template>

<script lang="ts">
import { upperFirst } from 'lodash';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n/types/index';

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      objects: [] as { title: TranslateResult; link: string; items: number }[]
    };
  },
  async fetch() {
    await this.$api.schema
      .fetchAll()
      .then((data) => {
        return data.map(async (key: { schemaName: string; endpoint: string }) => ({
          title: upperFirst(key.schemaName),
          link: `objects/${key.endpoint}`,
          // @ts-ignore
          items: (
            await this.$api.entity.fetchAll(`${key.endpoint}`, 0, {
              unit: this.unit.id
            })
          ).totalItemCount
        }));
      })
      .then((types) => {
        Promise.all(types).then((data) => {
          this.objects = data as any;
        });
      });
  }
});
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>
