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
  <BaseDialog
    :model-value="modelValue"
    :title="globalT('editor.schema.properties')"
    fixed-footer
    large
    :confirm-close="isFormDirty"
    @update:model-value="$emit('update:model-value', $event)"
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
          <BaseCard>
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
                  <v-tooltip location="bottom">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :icon="mdiTrashCanOutline"
                        variant="text"
                        @click="deleteSubType(subTypeIndex)"
                      />
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
                v-model="subType.status"
                item-key="key"
                handle=".handle"
              >
                <template #item="{ element, index }">
                  <EditorObjectSchemaStatusListItem
                    :status="element"
                    :index="index"
                    :lang="displayLanguage"
                    @update-status="(status) => onUpdateStatus(subTypeIndex, index, status)"
                    @delete="onDeleteStatus(subTypeIndex, index)"
                  />
                </template>
              </Draggable>
              <v-form
                v-model="newStatusForms[subTypeIndex]"
                @submit.prevent="addStatusToSubType(subTypeIndex)"
              >
                <v-list-item
                  class="px-0"
                  dense
                >
                  <v-text-field
                    v-model="newStatusTextfields[subTypeIndex]"
                    :label="upperFirst(t('status').toString())"
                    dense
                    variant="underlined"
                    :rules="[alphaNumericUnderscoreRule]"
                  />
                  <v-list-item-action>
                    <v-btn
                      variant="text"
                      :disabled="!newStatusForms[subTypeIndex] || !newStatusTextfields[subTypeIndex]"
                      @click="addStatusToSubType(subTypeIndex)"
                    >
                      <v-icon
                        :icon="mdiPlus"
                        start
                      />
                      {{ t('add') }}
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-form>
            </v-card-text>
          </BaseCard>
        </v-col>
        <v-col cols="12">
          <v-btn
            variant="text"
            @click="addSubType"
          >
            <v-icon
              :icon="mdiPlus"
              start
            />
            {{ t('addSubtype') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="subTypeForms.some((form) => form === false) || !isFormDirty"
        @click="onSubmit"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { mdiMenu, mdiPlus, mdiTranslate, mdiTrashCanOutline } from '@mdi/js';
import Draggable from 'vuedraggable';
import { upperFirst, cloneDeep, isEqual } from 'lodash';

import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { CHART_COLORS, separateUUIDParam } from '~/lib/utils';
import { Ref } from 'vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~~/composables/api/utils/query';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

export default defineComponent({
  components: {
    Draggable
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['schema-updated', 'update:model-value'],
  setup(props, { emit }) {
    const { t, locales } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const route = useRoute();

    const objectSchemaHelper: Ref<ObjectSchemaHelper | undefined> | undefined = inject('objectSchemaHelper');

    // display stuff
    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId as string }));
    const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters);

    const displayLanguage = inject<Ref<string>>('displayLanguage');
    // We can't use a computed here, as changes sadly won't get picked up.
    const languages = ref((objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({ title: t(key), value: key })));

    // objectschema stuff
    const subTypes: Ref<{ subType: string; status: { key: string; [lang: string]: string }[] }[]> = ref([]);
    const originalSubTypes: Ref<{ subType: string; status: { key: string; [lang: string]: string }[] }[]> = ref([]);
    const subTypeForms: Ref<boolean[]> = ref([]);
    const newStatusForms: Ref<boolean[]> = ref([]);
    const newStatusTextfields: Ref<(string | undefined)[]> = ref([]);

    watch(
      () => objectSchemaHelper?.value,
      () => {
        updateForm();
        languages.value = (objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({ title: (locales.value as LocaleObject[]).find((locale) => locale.code === key)?.name || key, value: key }));
      },
      {
        deep: true,
        immediate: true
      }
    );

    function updateForm() {
      if (objectSchemaHelper?.value) {
        const oshSubTypes = cloneDeep(objectSchemaHelper.value.getSubTypes(separateUUIDParam(route.params.domain as string).id));
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
      originalSubTypes.value = cloneDeep(subTypes.value);
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

    const isFormDirty = computed(() => !isEqual(subTypes.value, originalSubTypes.value));

    function onSubmit() {
      // Remove old translations
      for (const subType of originalSubTypes.value) {
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
      emit('update:model-value', false);
    }

    return {
      addStatusToSubType,
      addSubType,
      alphaNumericUnderscoreRule,
      deleteSubType,
      displayLanguage,
      domain,
      isFormDirty,
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
      globalT,
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
