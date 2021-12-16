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
  <VeoDialog
    v-model="dialog"
    :headline="upperFirst(t('createObject').toString())"
    x-large
    persistent
    fixed-footer
    fixed-header
    content-class="overflow-hidden fill-height"
    card-class="d-flex flex-column fill-height"
    inner-class="overflow-hidden"
  >
    <template #default>
      <VeoObjectForm
        v-model="objectData"
        :objectschema="objectschema"
        :domain-id="domainId"
        :preselected-sub-type="subType"
      />
    </template>
    <template #dialog-options>
      <div
        class="d-flex fill-width pt-3"
        style="border-top: 1px solid #0000001F"
        @click="dialog = false"
      >
        <v-btn text>
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
import { defineComponent, computed, ref, useFetch, useContext, Ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IVeoObjectSchema } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';

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
    const { $api } = useContext();
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
            objectData.value = {};
          }, 150);
        }
      }
    });

    // object schema stuff
    const objectschema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const objectData: any = ref({});

    useFetch(async () => {
      objectschema.value = await $api.schema.fetch(props.objectType, [props.domainId]);
    });

    async function onSubmit() {
      try {
        const result = await $api.entity.create(props.objectType, objectData.value);
        emit('success', result.resourceId);
        displaySuccessMessage(t('objectCreated', { name: objectData.name }).toString());
        dialog.value = false;
      } catch (e: any) {
        displayErrorMessage(t('objectNotCreated').toString(), JSON.stringify(e));
      }
    }

    return {
      dialog,
      objectschema,
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
    "objectCreated": "\"{name}\" was created successfully!",
    "objectNotCreated": "Couldn't create \"{name}\""
  },
  "de": {
    "createObject": "Objekt erstellen",
    "objectCreated": "\"{name}\" wurde erfolgreich erstellt!",
    "objectNotCreated": "\"{name}\" konnte nicht erstellt werden."
  }
}
</i18n>
