<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <VeoPageWrapper :page-widths="[8, 4]">
    <template #default>
      <VeoPage>
        <template #default>
          <v-row class="flex-column">
            <v-col>
              <v-row class="align-center">
                <v-col cols="auto">
                  <h3>{{ upperFirst(t('display').toString()) }}:</h3>
                </v-col>
                <v-col cols="auto">
                  <v-select
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col>
              <slot name="form" />
              <VeoForm
                v-model="objectData"
                :schema="objectschema"
              />
            </v-col>
          </v-row>
        </template>
      </VeoPage>
      <VeoPage>
        <template #default>
          <VeoTabs>
            <template #tabs>
              <v-tab>{{ t('tableOfContents') }}</v-tab>
              <v-tab>{{ t('messages') }} (0)</v-tab>
            </template>
            <template #items>
              <v-tab-item>
                Table of contents
              </v-tab-item>
              <v-tab-item>
                messages
              </v-tab-item>
            </template>
          </VeoTabs>
        </template>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { IBaseObject } from '~/lib/utils';

export default defineComponent({
  props: {
    value: {
      type: Object,
      default: () => {}
    } as PropOptions<IBaseObject>,
    objectschema: {
      type: Object,
      required: true
    },
    disableHistory: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const objectData = computed({
      get() {
        return props.value as IBaseObject;
      },
      set(newValue: IBaseObject) {
        emit('input', newValue);
      }
    });

    return {
      objectData,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "display": "display",
    "messages": "messages",
    "tableOfContents": "contents"
  },
  "de": {
    "display": "darstellung",
    "messages": "meldungen",
    "tableOfContents": "inhalt"
  }
}
</i18n>