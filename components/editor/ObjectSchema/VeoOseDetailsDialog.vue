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
    large
    persistent
    v-on="$listeners"
  >
    <template #default>
      <div class="d-flex justify-space-between align-center px-1 pb-2">
        <h2 class="text-h2">
          {{ t('subtypesForDomain', { domain: domain && domain.name }) }}
        </h2>
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
          v-for="(subType, subTypeIndex) of subTypes"
          :key="subTypeIndex"
          cols="6"
        >
          <VeoCard inverted>
            <v-card-text>
              <v-row>
                <v-col
                  cols="auto"
                  class="flex-grow-1"
                >
                  <v-form
                    v-model="subTypeForms[subTypeIndex]"
                    @submit.prevent
                  >
                    <v-text-field
                      v-model="subType.subType"
                      :label="`${upperFirst(t('subtype').toString())}*`"
                      dense
                      required
                      :rules="[requiredRule]"
                    />
                  </v-form>
                </v-col>
                <v-col cols="auto">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn
                        icon
                        v-on="on"
                        @click="deleteSubType(subTypeIndex)"
                      >
                        <v-icon>
                          {{ mdiTrashCanOutline }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <template #default>
                      {{ upperFirst(t('deleteSubtype').toString()) }}
                    </template>
                  </v-tooltip>
                </v-col>
              </v-row>
              <h3 class="text-h3 my-2">
                {{ upperFirst(t('availableStatus').toString()) }}
              </h3>
              <Draggable
                tag="div"
                :list="subType.status"
                handle=".handle"
              >
                <VeoOseStatusListItem
                  v-for="(status, statusIndex) in subType.status"
                  :key="status.key"
                  :status="status"
                  :index="statusIndex"
                  :lang="displayLanguage"
                  @update-status="(status) => onUpdateStatus(subTypeIndex, statusIndex, status)"
                  @delete="onDeleteStatus(subTypeIndex, statusIndex)"
                />
              </Draggable>
              <v-form
                v-model="newStatusForms[subTypeIndex]"
                @submit.prevent="addStatusToSubType(subTypeIndex)"
              >
                <v-list-item
                  class="px-0"
                  dense
                >
                  <v-list-item-content>
                    <v-text-field
                      v-model="newStatusTextfields[subTypeIndex]"
                      :label="upperFirst(t('status').toString())"
                      dense
                      :rules="[alphaNumericUnderscoreRule]"
                    />
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      text
                      :disabled="!newStatusForms[subTypeIndex] || !newStatusTextfields[subTypeIndex]"
                      @click="addStatusToSubType(subTypeIndex)"
                    >
                      <v-icon>
                        {{ mdiPlus }}
                      </v-icon>
                      {{ t('add') }}
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-form>
            </v-card-text>
          </VeoCard>
        </v-col>
        <v-col cols="12">
          <v-btn
            text
            @click="addSubType"
          >
            <v-icon>
              {{ mdiPlus }}
            </v-icon>
            {{ t('addSubtype') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #dialog-options>
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
        :disabled="subTypeForms.some((form) => !form)"
        @click="onSubmit"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, inject, useRoute, Ref, ref, watch, useAsync, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiMenu, mdiPlus, mdiTranslate, mdiTrashCanOutline } from '@mdi/js';
import Draggable from 'vuedraggable';
import { upperFirst, cloneDeep } from 'lodash';

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

    const objectSchemaHelper: Ref<ObjectSchemaHelper | undefined> | undefined = inject('objectSchemaHelper');

    // display stuff
    const domain = useAsync(() => $api.domain.fetch(props.domainId));

    const displayLanguage: Ref<string> | undefined = ref((inject('displayLanguage') as Ref<string>).value);
    // We can't use a computed here, as changes sadly won't get picked up.
    const languages = ref((objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({ text: t(key), value: key })));

    // objectschema stuff
    const subTypes: Ref<{ subType: string; status: { key: string; [lang: string]: string }[] }[]> = ref([]);
    const subTypeForms: Ref<boolean[]> = ref([]);
    const newStatusForms: Ref<boolean[]> = ref([]);
    const newStatusTextfields: Ref<(string | undefined)[]> = ref([]);
    updateForm();

    watch(
      () => objectSchemaHelper?.value,
      () => {
        updateForm();
        languages.value = (objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({ text: t(key), value: key }));
      },
      {
        deep: true
      }
    );

    function updateForm() {
      if (objectSchemaHelper?.value) {
        const oshSubTypes = cloneDeep(objectSchemaHelper.value.getSubTypes(separateUUIDParam(route.value.params.domain).id));
        subTypes.value = oshSubTypes.map((subType) => ({ subType: subType.subType, status: subType.status.map((_status) => ({ key: _status })) }));
        subTypeForms.value = Array(subTypes.value.length).fill(true);
        newStatusForms.value = Array(subTypes.value.length).fill(true);
        newStatusTextfields.value = Array(subTypes.value.length).fill(undefined);

        // Add translations to status
        for (const lang of objectSchemaHelper.value.getLanguages()) {
          for (const subTypeIndex in subTypes.value) {
            for (const statusIndex in subTypes.value[subTypeIndex].status) {
              const translation = objectSchemaHelper.value.getTranslation(
                lang,
                `${objectSchemaHelper.value.getTitle()}_${subTypes.value[subTypeIndex].subType}_status_${subTypes.value[subTypeIndex].status[statusIndex].key}`
              );
              if (translation) {
                subTypes.value[subTypeIndex].status[statusIndex][lang] = translation;
              }
            }
          }
        }
      }
    }

    function addStatusToSubType(index: number) {
      if (requiredRule(newStatusTextfields.value[index] || '') !== true || alphaNumericUnderscoreRule(newStatusTextfields.value[index] || '') !== true) {
        return;
      }
      subTypes.value[index].status.push({ key: newStatusTextfields.value[index] as string });
      newStatusTextfields.value[index] = undefined;
    }

    function addSubType() {
      subTypes.value.push({ subType: '', status: [] });
      subTypeForms.value.push(true);
      newStatusForms.value.push(true);
      newStatusTextfields.value.push(undefined);
    }

    function deleteSubType(index: number) {
      subTypes.value.splice(index, 1);
      subTypeForms.value.splice(index, 1);
      newStatusForms.value.splice(index, 1);
      newStatusTextfields.value.splice(index, 1);
    }

    function onUpdateStatus(subTypeIndex: number, statusIndex: number, status: { key: string; [lang: string]: string }) {
      subTypes.value[subTypeIndex].status[statusIndex] = status;
    }

    function onDeleteStatus(subTypeIndex: number, statusIndex: number) {
      subTypes.value[subTypeIndex].status.splice(statusIndex, 1);
    }

    // Validation
    const requiredRule = (v: string) => !!v || t('global.input.required');
    const alphaNumericUnderscoreRule = (v: string) => !v || /^[A-Z0-9_]+$/.test(v) || t('statusAlphaNumericUnderscore');

    function onSubmit() {
      // Remove old translations
      for (const subType of subTypes.value) {
        objectSchemaHelper?.value?.removeTranslationsContainingKey(`${objectSchemaHelper.value.getTitle()}_${subType.subType}_status`);
      }

      // Save domain
      objectSchemaHelper?.value?.updateDomain(
        props.domainId,
        subTypes.value.map((subType) => ({ subType: subType.subType, status: subType.status.map((status) => status.key) }))
      );

      // Save translations
      for (const lang of objectSchemaHelper?.value?.getLanguages() || []) {
        for (const subTypeIndex in subTypes.value) {
          for (const statusIndex in subTypes.value[subTypeIndex].status) {
            if (subTypes.value[subTypeIndex].status[statusIndex][lang]) {
              objectSchemaHelper?.value?.updateTranslation(
                lang,
                `${objectSchemaHelper.value.getTitle()}_${subTypes.value[subTypeIndex].subType}_status_${subTypes.value[subTypeIndex].status[statusIndex].key}`,
                subTypes.value[subTypeIndex].status[statusIndex][lang]
              );
            }
          }
        }
      }

      emit('schema-updated');
      emit('input', false);
    }

    return {
      addStatusToSubType,
      addSubType,
      alphaNumericUnderscoreRule,
      deleteSubType,
      displayLanguage,
      domain,
      languages,
      newStatusForms,
      newStatusTextfields,
      onDeleteStatus,
      onSubmit,
      onUpdateStatus,
      requiredRule,
      subTypeForms,
      subTypes,

      t,
      mdiMenu,
      mdiPlus,
      mdiTranslate,
      mdiTrashCanOutline,
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
    "deleteSubtype": "delete subtype",
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
    "deleteSubtype": "subtyp löschen",
    "language": "sprache",
    "status": "status",
    "statusAlphaNumericUnderscore": "Der Status darf nur großgeschriebene alphanummerische Zeichen und Unterstriche enthalten",
    "subtype": "subtyp",
    "subtypesForDomain": "Subtypen für die Domain {domain}"
  }
}
</i18n>
