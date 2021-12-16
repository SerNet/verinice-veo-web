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
    fixed-footer
    fixed-header
  >
    <template #default>
      <VeoObjectForm
        v-if="objectschema"
        v-model="objectData"
        :objectschema="objectschema"
      />
      <template
        v-for="index in 12"
        v-else
      >
        <v-skeleton-loader
          :key="index"
          type="heading"
          class="my-4"
        />
      </template>
      
    </template>
    <template #dialog-options>
      <div
        class="d-flex fill-width pt-3"
        style="border-top: 1px solid #0000001F"
      >
        <v-btn text>
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          color="primary"
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

    // Display stuff
    const dialog = computed({
      get() {
        return props.value;
      },
      set(value: boolean) {
        emit('input', value);
      }
    });

    // object schema stuff
    const objectschema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const objectData = ref({});

    useFetch(async () => {
      objectschema.value = await $api.schema.fetch(props.objectType, [props.domainId]);
    });

    return {
      dialog,
      objectschema,
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
    "createObject": "create object"
  },
  "de": {
    "createObject": "Objekt erstellen"
  }
}
</i18n>
