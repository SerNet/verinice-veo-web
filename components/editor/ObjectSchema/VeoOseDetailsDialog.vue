<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <VeoDialog
    :value="value"
    :headline="t('editor.schema.properties')"
    fixed-footer
    fixed-header
    large
    persistent
    v-on="$listeners"
  >
    <template #default>
      <div class="d-flex justify-space-between align-center px-1 pb-2">
        <h2>{{ t('subtypesForDomain', { domain: domain && domain.name }) }}</h2>
        <v-select
          v-model="displayLanguage"
          :prepend-inner-icon="mdiTranslate"
          :label="upperFirst(t('language').toString())"
          dense
          hide-details
          :items="languages"
          style="max-width: 200px;"
        />
      </div>
      <v-row>
        <v-col
          v-for="subType of subTypes"
          :key="subType.subType"
          cols="6"
        >
          <v-card outlined>
            <v-card-text>
              <v-text-field
                v-model="subType.subType"
                :label="`${upperFirst(t('subtype').toString())}*`"
                dense
                required
                :rules="[requiredRule]"
              />
              <h3 class="my-2">
                {{ upperFirst(t('availableStatus').toString()) }}
              </h3>
              <Draggable
                tag="div"
                :list="subType.status"
                handle=".handle"
              >
                <VeoOseStatusListItem
                  v-for="(status, index) in subType.status"
                  :key="status"
                  :status="status"
                  :index="index"
                />
              </Draggable>
              <v-list-item
                class="px-0"
                dense
              >
                <v-list-item-content>
                  <v-text-field
                    :label="upperFirst(t('status').toString())"
                    dense
                    :rules="[alphaNumericUnderscoreRule]"
                  />
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn text>
                    <v-icon>
                      {{ mdiPlus }}
                    </v-icon>
                    {{ t('add') }}
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-btn text>
            <v-icon>
              {{ mdiPlus }}
            </v-icon>
            {{ t('addSubtype') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #dialog-options>
      <div
        class="d-flex fill-width pt-3"
        style="border-top: 1px solid #0000001F"
      >
        <v-btn
          text
          @click="$emit('input', false)"
        >
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          color="primary"
          @click="onSubmit"
        >
          {{ t('global.button.save') }}
        </v-btn>
      </div>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, inject, useRoute, Ref, ref, computed, useAsync, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiMenu, mdiPlus, mdiTranslate } from '@mdi/js';
import Draggable from 'vuedraggable';
import { upperFirst } from 'lodash';

import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { CHART_COLORS, separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  components: {
    Draggable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { $api } = useContext();

    // const display stuff
    const domain = useAsync(() => $api.domain.fetch(props.domainId));

    const languages = [
      {
        text: 'English',
        value: 'en'
      },
      {
        text: 'Deutsch',
        value: 'de'
      }
    ];
    const displayLanguage: Ref<string> | undefined = ref((inject('displayLanguage') as Ref<string>).value);

    const objectSchemaHelper: Ref<ObjectSchemaHelper | undefined> | undefined = inject('objectSchemaHelper');
    const subTypes = computed(() => objectSchemaHelper?.value?.getSubTypes(separateUUIDParam(route.value.params.domain).id) || []);

    // Validation
    const requiredRule = (v: string) => !!v || t('global.input.required');
    const alphaNumericUnderscoreRule = (v: string) => !v || /^[A-Z0-9_]+$/.test(v) || t('statusAlphaNumericUnderscore');

    function onSubmit() {
      emit('input', false);
    }

    return {
      displayLanguage,
      domain,
      languages,
      onSubmit,
      requiredRule,
      alphaNumericUnderscoreRule,
      subTypes,

      t,
      mdiMenu,
      mdiPlus,
      mdiTranslate,
      upperFirst,
      CHART_COLORS
    };
  }
});
</script>

<i18n>
{
  "en": {
    "add": "add",
    "addSubtype": "add subtype",
    "availableStatus": "available status",
    "language": "language",
    "status": "status",
    "statusAlphaNumericUnderscore": "The status may only contain capital alphanumeric symbols and underscores",
    "subtype": "subtype",
    "subtypesForDomain": "Subtypes for domain {domain}"
  },
  "de": {
    "add": "hinzufügen",
    "addSubtype": "subtyp hinzufügen",
    "availableStatus": "verfügbare Status",
    "language": "sprache",
    "status": "status",
    "statusAlphaNumericUnderscore": "Der Status darf nur großgeschriebene alphanummerische Zeichen und Unterstriche enthalten",
    "subtype": "Subtyp",
    "subtypesForDomain": "Subtypen für die Domain {domain}"
  }
}
</i18n>
