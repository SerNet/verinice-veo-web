<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Annemarie Bufe
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <VeoWidget :title="$t('forms', { domain: domain.name })">
    <v-simple-table dense>
      <tbody v-if="$fetchState.pending">
        <tr
          v-for="index in 10"
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
          v-for="form of formattedForms"
          :key="form.form.id"
        >
          <td>{{ form.name }}</td>
          <td class="text-right">
            <nuxt-link
              :to="`/${$route.params.unit}/domains/${createUUIDUrlParam('domain', domain.id)}/forms/${createUUIDUrlParam('form', form.form.id || '')}`"
            >
              <b>{{ form.totalItems }}</b>
            </nuxt-link>
          </td>
        </tr>
        <tr v-if="forms.length === 0">
          <td
            colspan="2"
            class="font-italic"
          >
            {{ $t('noForms') }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { createUUIDUrlParam } from '~/lib/utils';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoDomain, IVeoFormSchemaMeta, IVeoUnit } from '~/types/VeoTypes';

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
      forms: [] as IVeoFormSchemaMeta[],
      formattedForms: [] as { name: string; totalItems: number; form: IVeoFormSchemaMeta }[],
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    this.schemas = await this.$api.schema.fetchAll();
    this.forms = await this.$api.form.fetchAll(this.domain.id);

    for (const form of this.forms) {
      this.formattedForms.push({
        name: form.name[this.$i18n.locale] || 'Missing translation',
        form,
        totalItems: (
          await this.$api.entity.fetchAll(getSchemaEndpoint(this.schemas, form.modelType) as string, 0, {
            unit: this.unit.id,
            subType: form.subType ?? undefined
          })
        ).totalItemCount
      });
    }
  },
  mounted() {
    this.$i18n.onLanguageSwitched = () => {
      for (const form of this.formattedForms) {
        form.name = form.form.name[this.$i18n.locale];
      }
    };
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
a {
  text-decoration: none;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }
}
</style>
