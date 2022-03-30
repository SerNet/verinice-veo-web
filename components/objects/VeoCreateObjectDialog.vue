<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Markus Werner
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
    v-model="dialog"
    :headline="headline"
    x-large
    :persistent="isFormDirty"
    fixed-footer
    inner-class="overflow-hidden"
    v-on="$listeners"
  >
    <template #default>
      <VeoObjectForm
        v-model="objectData"
        :object-schema="objectSchema"
        :domain-id="domainId"
        :preselected-sub-type="subType"
        :valid.sync="formValid"
        disable-history
        scroll-wrapper-id="scroll-wrapper-create-dialog"
        object-creation-disabled
        @input="isFormDirty = true"
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        :data-cy="$utils.prefixCyData($options, 'cancel-button')"
        @click="dialog = false"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!formValid"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
        @click="onSubmit"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, Ref, useRoute, computed, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IVeoObjectSchema } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    objectType: {
      type: String,
      required: true
    },
    subType: {
      type: String,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { $api, $config } = useContext();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    // Display stuff
    const dialog = computed({
      get() {
        return props.value;
      },
      set(value: boolean) {
        emit('input', value);

        // If the dialog gets closed, restore pristine state, 150ms seems to be the animation duration of v-dialog
        if (!value) {
          setTimeout(() => {
            seedInitialData();
          }, 150);
        }
      }
    });

    const isFormDirty = ref(false);

    // object schema stuff
    const objectSchema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const objectData: any = ref({});
    seedInitialData();

    function seedInitialData() {
      objectData.value = {
        owner: {
          targetUri: `${$config.apiUrl}/units/${separateUUIDParam(route.value.params.unit).id}`
        }
      };
      isFormDirty.value = false;
    }

    const { fetch } = useFetch(async () => {
      objectSchema.value = await $api.schema.fetch(props.objectType, [props.domainId]);
    });

    // refetch on objectType change
    watch(() => props.objectType, fetch);

    // Actions
    async function onSubmit() {
      try {
        const result = await $api.entity.create(props.objectType, objectData.value);
        emit('success', result.resourceId);
        displaySuccessMessage(upperFirst(t('objectCreated', { name: objectData.value.name }).toString()));
        dialog.value = false;
      } catch (e: any) {
        displayErrorMessage(upperFirst(t('objectNotCreated', { name: objectData.value.name || upperFirst(t('object').toString()) }).toString()), JSON.stringify(e));
      }
    }

    const headline = computed(() => upperFirst(t('createObject').toString()) + ': ' + upperFirst(props.objectType));

    const formValid = ref(false);

    return {
      dialog,
      headline,
      isFormDirty,
      formValid,
      objectSchema,
      objectData,
      onSubmit,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "create object",
    "object": "object",
    "objectCreated": "\"{name}\" was created successfully!",
    "objectNotCreated": "couldn't create \"{name}\""
  },
  "de": {
    "createObject": "objekt erstellen",
    "object": "objekt",
    "objectCreated": "\"{name}\" wurde erfolgreich erstellt!",
    "objectNotCreated": "\"{name}\" konnte nicht erstellt werden."
  }
}
</i18n>
