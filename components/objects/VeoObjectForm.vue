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
      <VeoPage sticky-header>
        <template #header>
          <v-row class="align-center mx-0 pb-4">
            <v-col cols="auto">
              <h3>{{ upperFirst(t('display').toString()) }}:</h3>
            </v-col>
            <v-col cols="auto">
              <v-select
                v-model="selectedDisplayOption"
                dense
                hide-details
                :items="displayOptions"
              />
            </v-col>
          </v-row>
        </template>
        <template #default>
          <slot name="form" />
          <VeoForm
            v-if="!$fetchState.pending && objectschema"
            v-model="objectData"
            :schema="objectschema"
            :ui="currentFormSchema && currentFormSchema.content"
            :general-translation="translations && translations[locale]"
            :custom-translation="currentFormSchema && currentFormSchema.translation && currentFormSchema.translation[locale]"
          />
          <v-skeleton-loader
            v-else
            type="text@3"
          />
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
import { computed, ComputedRef, defineComponent, PropOptions, Ref, ref, useContext, useFetch, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IBaseObject } from '~/lib/utils';
import { IVeoFormSchema, IVeoFormSchemaMeta, IVeoObjectSchema, IVeoTranslationCollection } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Object,
      default: () => {}
    } as PropOptions<IBaseObject>,
    objectschema: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoObjectSchema>,
    disableHistory: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    },
    preselectedSubType: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const { $api } = useContext();

    // Formschema/display stuff
    const translations: Ref<{ [key: string]: IVeoTranslationCollection } | undefined> = ref(undefined);
    const formSchemas: Ref<IVeoFormSchemaMeta[]> = ref([]);
    const currentFormSchema: Ref<undefined | IVeoFormSchema> = ref(undefined);
    const { $fetch } = useFetch(async () => {
      if (!translations.value) {
        translations.value = (await $api.translation.fetch(['de', 'en'])).lang;
      }
      if (formSchemas.value.length === 0) {
        formSchemas.value = await $api.form.fetchAll(props.domainId);

        if (props.preselectedSubType) {
          const formSchemaId = getFormschemaIdBySubType(props.preselectedSubType);

          if (formSchemaId) {
            selectedDisplayOption.value = formSchemaId;
          }
        }
      }
      if (selectedDisplayOption.value !== 'objectschema') {
        currentFormSchema.value = await $api.form.fetch(selectedDisplayOption.value);
      } else {
        currentFormSchema.value = undefined;
      }
    });

    const selectedDisplayOption = ref('objectschema');
    const displayOptions: ComputedRef<{ text: string; value: string | undefined }[]> = computed(() => {
      const availableFormSchemas: { text: string; value: string | undefined }[] = formSchemas.value
        .filter((formSchema) => formSchema.modelType === props.objectschema?.title)
        .map((formSchema) => ({
          text: formSchema.name[locale.value] || formSchema.subType,
          value: formSchema.id
        }));
      availableFormSchemas.unshift({ text: upperFirst(t('objectView').toString()), value: 'objectschema' });
      return availableFormSchemas;
    });

    watch(selectedDisplayOption, () => {
      $fetch();
    });

    function getFormschemaIdBySubType(subType: string) {
      const formSchemaId = formSchemas.value.find((formschema) => formschema.subType === subType)?.id;
      if (formSchemaId) {
        return formSchemaId;
      }
    }

    watch(
      () => props.preselectedSubType,
      (newValue) => {
        const formSchemaId = getFormschemaIdBySubType(newValue);
        if (newValue && formSchemaId) {
          selectedDisplayOption.value = formSchemaId;
        } else {
          selectedDisplayOption.value = 'objectschema';
        }
      }
    );

    // Form stuff
    const objectData = computed({
      get() {
        return props.value as IBaseObject;
      },
      set(newValue: IBaseObject) {
        emit('input', newValue);
      }
    });

    return {
      currentFormSchema,
      displayOptions,
      locale,
      objectData,
      selectedDisplayOption,
      translations,

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
    "objectView": "object view",
    "tableOfContents": "contents"
  },
  "de": {
    "display": "darstellung",
    "messages": "meldungen",
    "objectView": "objektansicht",
    "tableOfContents": "inhalt"
  }
}
</i18n>