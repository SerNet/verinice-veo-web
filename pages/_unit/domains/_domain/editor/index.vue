<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <VeoPage
    :title="t('calltoaction').toString()"
    :heading-level="2"
    fullsize
  >
    <div class="d-flex justify-center">
      <VeoCard
        class="mt-10"
        style="width: 70%"
      >
        <v-list
          two-line
          class="overflow-hidden"
        >
          <v-list-item :to="`/${$route.params.unit}/domains/${$route.params.domain}/editor/objectschema`">
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ t('editor.objectschema.headline') }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ t('objectSchemaDescription') }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon x-large>
                mdi-chevron-right
              </v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-list-item :to="`/${$route.params.unit}/domains/${$route.params.domain}/editor/formschema`">
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ t('editor.formschema.headline') }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ t('formSchemaDescription') }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon x-large>
                mdi-chevron-right
              </v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </VeoCard>
    </div>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

interface IProps {}

export const ROUTE_NAME = 'unit-domains-domain-editor';

export default defineComponent<IProps>({
  name: 'VeoEditorIndexPage',
  setup() {
    const { t } = useI18n();

    return {
      t
    };
  },
  head(): any {
    return {
      title: 'verinice.'
    };
  }
});
</script>

<i18n>
{
  "en": {
    "calltoaction": "What do you want to do?",
    "formSchemaDescription": "Create, edit, import or export form schemas",
    "objectSchemaDescription": "Create, edit, import or export object schemas"
  },
  "de": {
    "calltoaction": "Was möchten Sie tun?",
    "formSchemaDescription": "Formschemas erstellen, bearbeiten, importieren und exportieren",
    "objectSchemaDescription": "Objektschemas erstellen, bearbeiten, importieren und exportieren"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
