<template>
  <VeoWidget :title="$t('forms', { domain: domain.name })">
    <template v-if="$fetchState.pending">
      <table>
        <tr
          v-for="type of objects"
          :key="type.id"
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
      </table>
    </template>
    <template v-else>
      <table>
        <tr
          v-for="type of objects"
          :key="type.id"
        >
          <td>{{ type.name }}:</td>
          <td class="text-right">
            <nuxt-link
              :to="`/${$route.params.unit}/domains/${createUUIDUrlParam('domain', domain.id)}/forms/${createUUIDUrlParam('form', type.id)}`"
            >
              <b>{{ type.items }}</b>
            </nuxt-link>
          </td>
        </tr>
        <tr v-if="objects.length === 0">
          <td
            colspan="2"
            class="font-italic"
          >
            {{ $t('noForms') }}
          </td>
        </tr>
      </table>
    </template>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { endpoints } from '~/plugins/api/schema';
import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoDomain, IVeoUnit } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    unit: {
      type: Object as Prop<IVeoUnit>,
      required: true
    },
    domain: {
      type: Object as Prop<IVeoDomain>,
      required: true
    }
  },
  data() {
    return {
      objects: [] as any
    };
  },
  async fetch() {
    this.objects = await this.$api.form.fetchAll(this.domain.id);
    for (const object of this.objects) {
      // @ts-ignore
      const objectType = endpoints[object.modelType];
      object.items = (
        await this.$api.entity.fetchAll(objectType, 0, {
          unit: this.unit.id,
          subType: object.subType
        })
      ).totalItemCount;
      object.name = object.name[this.$i18n.locale] || 'Missing translation';
    }
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<i18n>
{
  "en": {
    "forms": "Forms in {domain}",
    "noForms": "No forms existing"
  },
  "de": {
    "forms": "Formulare in {domain}",
    "noForms": "Keine Formulare vorhanden"
  }
}
</i18n>

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
