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
      <v-row class="d-flex justify-space-between align-center mx-2">
        <v-col cols="9">
          <h2 class="text-h2 small-caps">
            {{ t('subtypesForDomain', { domain: domain?.name }) }}
          </h2>
        </v-col>

        <v-col cols="3">
          <v-select
            v-model="displayLanguage"
            :prepend-inner-icon="mdiTranslate"
            :label="t('language').toString()"
            dense
            hide-details
            :items="languages"
            style="max-width: 200px"
          />
        </v-col>
      </v-row>

      <v-row class="d-flex justify-space-between align-center">
        <v-col v-for="(subType, subTypeIndex) of subTypes" :key="subTypeIndex" cols="6">
          <BaseCard style="border: 1px solid grey" class="ml-4">
            <v-card-text>
              <v-form v-model="subTypeForms[subTypeIndex]" @submit.prevent>
                <v-row>
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="9">
                        <v-text-field
                          v-model="subType.subType"
                          :label="`${t('subtype').toString()}*`"
                          dense
                          required
                          :rules="[requiredRule]"
                        />
                      </v-col>
                      <v-spacer />
                      <v-col>
                        <v-tooltip location="bottom">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              :icon="mdiTrashCanOutline"
                              color="primary"
                              variant="tonal"
                              @click="deleteSubType(subTypeIndex)"
                            />
                          </template>
                          <template #default>
                            {{ t('deleteSubtype').toString() }}
                          </template>
                        </v-tooltip>
                      </v-col>
                    </v-row>

                    <v-row class="mt-0">
                      <v-col cols="6">
                        <v-text-field
                          v-model="subType.subTypeTranslations[displayLanguage || ''].singular"
                          dense
                          :prepend-inner-icon="mdiTranslate"
                          :label="t('translation.singular').toString()"
                          hide-details
                          variant="underlined"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="subType.subTypeTranslations[displayLanguage || ''].plural"
                          dense
                          :prepend-inner-icon="mdiTranslate"
                          :label="t('translation.plural').toString()"
                          hide-details
                          variant="underlined"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>

              <h3 class="text-h3 mt-8">
                {{ t('availableStatus').toString() }}
              </h3>

              <Draggable v-model="subType.status" item-key="key" handle=".handle">
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
                class="mt-4"
                @submit.prevent="addStatusToSubType(subTypeIndex)"
              >
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="newStatusTextfields[subTypeIndex]"
                      :label="t('status').toString()"
                      dense
                      variant="underlined"
                      :rules="[alphaNumericUnderscoreRule]"
                    />
                    <v-btn
                      variant="outlined"
                      :disabled="!newStatusForms[subTypeIndex] || !newStatusTextfields[subTypeIndex]"
                      @click="addStatusToSubType(subTypeIndex)"
                    >
                      <v-icon :icon="mdiPlus" start />
                      {{ t('add') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </BaseCard>
        </v-col>

        <v-col cols="12">
          <v-btn class="ml-4" color="primary" @click="addSubType">
            <v-icon :icon="mdiPlus" start />
            {{ t('addSubtype') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="$emit('update:model-value', false)">
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
import { cloneDeep, isEqual } from 'lodash';

import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { CHART_COLORS } from '~/lib/utils';
import { Ref } from 'vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~/composables/api/utils/query';
import type { LocaleObject } from '@nuxtjs/i18n';

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
    const fetchDomainQueryParameters = computed(() => ({
      id: props.domainId as string
    }));
    const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters);

    const displayLanguage = inject<Ref<string>>('displayLanguage');

    // We can't use a computed here, as changes sadly won't get picked up.
    const languages = ref(
      (objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({
        title: t(key),
        value: key
      }))
    );

    // objectschema stuff
    const subTypes: Ref<
      { subType: string; status: { key: string; [lang: string]: string }[]; subTypeTranslations: Record<string, any> }[]
    > = ref([]);
    const originalSubTypes: Ref<{ subType: string; status: { key: string; [lang: string]: string }[] }[]> = ref([]);
    const subTypeForms: Ref<boolean[]> = ref([]);
    const newStatusForms: Ref<boolean[]> = ref([]);
    const newStatusTextfields: Ref<(string | undefined)[]> = ref([]);

    watch(
      () => objectSchemaHelper?.value,
      () => {
        updateForm();
        languages.value = (objectSchemaHelper?.value?.getLanguages() || []).map((key) => ({
          title: (locales.value as LocaleObject[]).find((locale) => locale.code === key)?.name || key,
          value: key
        }));
      },
      {
        deep: true,
        immediate: true
      }
    );

    function updateForm() {
      if (objectSchemaHelper?.value) {
        const oshSubTypes = cloneDeep(objectSchemaHelper.value.getSubTypes(route.params.domain as string));
        subTypes.value = oshSubTypes.map((subType) => ({
          subType: subType.subType,
          status: subType.status.map((_status) => ({ key: _status })),
          subTypeTranslations: {}
        }));
        subTypeForms.value = Array(subTypes.value.length).fill(true);
        newStatusForms.value = Array(subTypes.value.length).fill(true);
        newStatusTextfields.value = Array(subTypes.value.length).fill(undefined);

        // Add translations to status
        for (const lang of objectSchemaHelper.value.getLanguages()) {
          for (const subTypeIndex in subTypes.value) {
            if (subTypes.value[subTypeIndex]) {
              subTypes.value[subTypeIndex].subTypeTranslations[lang] = {
                plural: objectSchemaHelper.value.getTranslation(
                  lang,
                  `${objectSchemaHelper?.value?.getTitle()}_${subTypes.value[subTypeIndex].subType}_plural`
                ),
                singular: objectSchemaHelper.value.getTranslation(
                  lang,
                  `${objectSchemaHelper?.value?.getTitle()}_${subTypes.value[subTypeIndex].subType}_singular`
                )
              };
            }
            for (const statusIndex in subTypes.value[subTypeIndex]?.status) {
              const translation = objectSchemaHelper.value.getTranslation(
                lang,
                `${objectSchemaHelper.value.getTitle()}_${subTypes.value[subTypeIndex].subType}_status_${
                  subTypes.value[subTypeIndex].status[statusIndex].key
                }`
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
      if (
        requiredRule(newStatusTextfields.value[index] || '') !== true ||
        alphaNumericUnderscoreRule(newStatusTextfields.value[index] || '') !== true
      ) {
        return;
      }
      subTypes.value[index]?.status.push({
        key: newStatusTextfields.value[index] as string
      });
      newStatusTextfields.value[index] = undefined;
    }

    function addSubType() {
      subTypes.value.push({
        subType: '',
        status: [],
        subTypeTranslations: Object.fromEntries(
          (objectSchemaHelper?.value?.getLanguages() || []).map((lang) => [lang, {}])
        )
      });
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

    function onUpdateStatus(
      subTypeIndex: number,
      statusIndex: number,
      status: { key: string; [lang: string]: string }
    ) {
      if (subTypes.value[subTypeIndex]) {
        subTypes.value[subTypeIndex].status[statusIndex] = status;
      }
    }

    function onDeleteStatus(subTypeIndex: number, statusIndex: number) {
      subTypes.value[subTypeIndex]?.status.splice(statusIndex, 1);
    }

    // Validation
    const requiredRule = (v: string) => !!v || t('global.input.required');
    const alphaNumericUnderscoreRule = (v: string) => !v || /^[A-Z0-9_]+$/.test(v) || t('statusAlphaNumericUnderscore');

    const isFormDirty = computed(() => !isEqual(subTypes.value, originalSubTypes.value));

    function onSubmit() {
      // Remove old translations
      for (const subType of originalSubTypes.value) {
        objectSchemaHelper?.value?.removeTranslationsContainingKey(
          `${objectSchemaHelper.value.getTitle()}_${subType.subType}_status`
        );
      }

      // Save domain
      objectSchemaHelper?.value?.updateDomain(
        props.domainId,
        subTypes.value.map((subType) => ({
          subType: subType.subType,
          status: subType.status.map((status) => status.key)
        }))
      );

      // Save translations
      for (const lang of objectSchemaHelper?.value?.getLanguages() || []) {
        for (const subTypeIndex in subTypes.value) {
          if (subTypes.value[subTypeIndex]?.subTypeTranslations[lang]?.singular) {
            objectSchemaHelper?.value?.updateTranslation(
              lang,
              `${objectSchemaHelper?.value?.getTitle()}_${subTypes.value[subTypeIndex].subType}_singular`,
              subTypes.value[subTypeIndex]?.subTypeTranslations[lang]?.singular
            );
          }

          if (subTypes.value[subTypeIndex]?.subTypeTranslations[lang]?.plural) {
            objectSchemaHelper?.value?.updateTranslation(
              lang,
              `${objectSchemaHelper?.value?.getTitle()}_${subTypes.value[subTypeIndex].subType}_plural`,
              subTypes.value[subTypeIndex]?.subTypeTranslations[lang]?.plural
            );
          }

          for (const statusIndex in subTypes.value[subTypeIndex]?.status) {
            if (subTypes.value[subTypeIndex].status[statusIndex][lang]) {
              objectSchemaHelper?.value?.updateTranslation(
                lang,
                `${objectSchemaHelper.value.getTitle()}_${subTypes.value[subTypeIndex].subType}_status_${
                  subTypes.value[subTypeIndex].status[statusIndex].key
                }`,
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
      CHART_COLORS
    };
  }
});
</script>

<i18n>
{
  "en": {
    "add": "Add",
    "addSubtype": "Add subtype",
    "availableStatus": "Available status",
    "deleteSubtype": "Delete subtype",
    "language": "Language",
    "status": "Status",
    "statusAlphaNumericUnderscore": "The status may only contain capital alphanumeric symbols and underscores",
    "subtype": "Subtype",
    "subtypesForDomain": "Subtypes for domain {domain}",
    "translation": {
      "singular": "Name singular",
      "plural": "Name plural"
    }
  },
  "de": {
    "add": "Hinzufügen",
    "addSubtype": "Subtyp hinzufügen",
    "availableStatus": "Verfügbare Status",
    "deleteSubtype": "Subtyp löschen",
    "language": "Sprache",
    "status": "Status",
    "statusAlphaNumericUnderscore": "Der Status darf nur großgeschriebene alphanummerische Zeichen und Unterstriche enthalten",
    "subtype": "Subtyp",
    "subtypesForDomain": "Subtypen für die Domäne {domain}",
    "translation": {
      "singular": "Name singular",
      "plural": "Name plural"
    }
  }
}
</i18n>
