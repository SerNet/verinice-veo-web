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
  <div class="d-flex flex-column">
    <div>
      <VeoObjectSelect
        :key="key"
        :value="value"
        :object-type="objectType"
        :sub-type="subType"
        :label="options.label"
        :domain-id="domainId"
        :hidden-values="hiddenValues"
        required
        :error-messages="getControlErrorMessages($props, '/properties/target')"
        value-as-link
        v-on="$listeners"
      >
        <template
          v-if="!objectCreationDisabled"
          #prepend-item
        >
          <v-btn
            block
            color="primary"
            text
            @click="createObjectDialogVisible = true"
          >
            <v-icon left>
              {{ mdiPlus }}
            </v-icon>
            {{ t('create', [createButtonLabel]).toString() }}
          </v-btn>
        </template>
      </VeoObjectSelect>
      <VeoCreateObjectDialog
        v-if="createObjectDialogVisible"
        v-model="createObjectDialogVisible"
        :object-type="objectType"
        :sub-type="subType"
        :domain-id="domainId"
        @success="onTargetCreated"
      />
    </div>
    <div>
      <VeoLinksFieldRowAttribute v-bind="$props">
        <slot />
      </VeoLinksFieldRowAttribute>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiPlus } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoFormSchemaMeta } from '~/types/VeoTypes';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-links-field-row',
  name: {
    en: 'links field row',
    de: 'Link-Feld-Eintrag'
  },
  description: {
    en: 'Row of the links field. Not used independently.',
    de: 'Einzelner Eintrag des Link-Feldes. Wird nicht alleine genutzt.'
  }
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: {
    ...VeoFormsControlProps,
    otherSelectedLinks: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const { $api } = useContext();
    const route = useRoute();
    const { t, locale } = useI18n();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const objectType = computed<string>(() => ((props.objectSchema as any).items.properties.target.properties.type.enum[0] + '').toLowerCase());
    const subType = computed<string>(() => (props.objectSchema as any).items.properties.target.properties.subType?.enum?.[0]);

    const formSchemas = ref<IVeoFormSchemaMeta[]>();
    useFetch(async () => {
      formSchemas.value = await $api.form.fetchAll(domainId.value);
    });

    const createButtonLabel = computed(() =>
      subType.value ? formSchemas.value?.find((formSchema) => formSchema.subType === subType.value)?.name?.[locale.value] || objectType.value : objectType.value
    );

    // new object cration
    const createObjectDialogVisible = ref(false);
    const onTargetCreated = () => {
      key.value = key.value + 1;
    };

    // Used to remount VeoObjectSelect after object has been created to reload all items.
    const key = ref(0);

    // Users should only be able to select an item once per link, thus we have to remove all already selected items from the VeoObjectSelect
    const hiddenValues = computed(() => props.otherSelectedLinks.filter((link: any) => link.target?.targetUri).map((link: any) => getEntityDetailsFromLink(link.target).id));

    return {
      createButtonLabel,
      createObjectDialogVisible,
      domainId,
      hiddenValues,
      key,
      objectType,
      onTargetCreated,
      subType,

      getControlErrorMessages,
      mdiPlus,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "create": "create {0}"
  },
  "de": {
    "create": "{0} erstellen"
  }
}
</i18n>
