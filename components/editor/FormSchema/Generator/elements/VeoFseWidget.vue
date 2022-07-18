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
  <v-card
    rounded
    flat
    outlined
    class="fse-generator-element mx-3 my-2"
  >
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col
          cols="auto"
          class="d-flex align-center px-1 fse-widget-dragbar grey darken-4"
        >
          <v-icon
            class="handle"
            color="white"
          >
            {{ mdiMenu }}
          </v-icon>
        </v-col>
        <v-col class="mx-2">
          <div class="text-h5 font-weight-regular">
            {{ upperFirst(t('widget').toString()) }}
          </div>
          <br>
          <div class="text-body-2 d-flex flex-row align-center">
            <span class="pr-2">{{ name[locale] || Object.values(name)[0] }}</span>
            <v-tooltip
              v-if="description"
              bottom
            >
              <template #activator="{ on }">
                <v-icon
                  small
                  v-on="on"
                >
                  {{ mdiInformationOutline }}
                </v-icon>
              </template>
              <template #default>
                {{ description }}
              </template>
            </v-tooltip>
          </div>
        </v-col>
        <v-col
          cols="auto"
          class="text-right pr-2"
        >
          <v-btn
            icon
            x-small
            @click="deleteDialogVisible = true"
          >
            <v-icon
              v-cy-name="'delete-button'"
              dense
              small
            >
              {{ mdiTrashCanOutline }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <VeoFseDeleteDialog
      v-model="deleteDialogVisible"
      @delete="deleteWidget"
    />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';
import { mdiInformationOutline, mdiMenu, mdiTrashCanOutline } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

export default defineComponent({
  props: {
    key: {
      type: String,
      required: true
    },
    name: {
      type: Object,
      default: () => {}
    },
    description: {
      type: String,
      default: undefined
    },
    formSchemaPointer: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { locale, t } = useI18n();

    const deleteDialogVisible = ref(false);

    const deleteWidget = () => {
      deleteDialogVisible.value = false;
      emit('delete', { name: props.key, formSchemaPointer: props.formSchemaPointer });
    };

    return {
      deleteDialogVisible,
      deleteWidget,
      locale,

      mdiInformationOutline,
      mdiMenu,
      mdiTrashCanOutline,
      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "widget": "widget"
  },
  "de": {
    "widget": "Widget"
  }
}
</i18n>

<style lang="scss" scoped>
.fse-generator-element {
  min-width: 300px;
}
</style>