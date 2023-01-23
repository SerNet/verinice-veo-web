<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann
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
    flat
    outlined
    rounded
    class="fse-label mx-3 my-2 px-2"
  >
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon
          size="small"
          class="handle pr-1"
          :icon="mdiMenu"
        />
      </v-col>
      <v-col>
        <div class="text-h5 font-weight-regular text-truncate">
          {{ label }}
          <EditorFormSchemaRuleDisplay
            v-if="effect"
            :model-value="effect"
          />
        </div>
      </v-col>
      <v-col
        cols="auto"
        class="text-right"
      >
        <v-btn
          icon
          x-small
          @click="showEdit"
        >
          <v-icon
            size="small"
            :icon="mdiPencil"
          />
        </v-btn>
        <v-btn
          icon
          x-small
          @click="showDelete"
        >
          <v-icon
            size="small"
            :icon="mdiTrashCanOutline"
          />
        </v-btn>
      </v-col>
    </v-row>

    <EditorFormSchemaEditLabelDialog
      v-model="editDialog"
      v-bind="$props"
      :form-schema="modelValue"
      :name="name"
      @edit="onEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <EditorFormSchemaDeleteDialog
      v-model="deleteDialog"
      @delete="onDelete"
    />
  </v-card>
</template>

<script lang="ts">
import { mdiMenu, mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import { PropType } from 'vue';

import { IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';

export default {
  props: {
    modelValue: {
      type: Object,
      default: undefined
    },
    name: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: undefined
    },
    customTranslations: {
      type: Object as PropType<IVeoFormSchemaTranslationCollection>,
      default: () => ({})
    },
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    language: {
      type: String,
      required: true
    }
  },
  emits: ['update', 'delete', 'update-custom-translation'],
  data() {
    return {
      editDialog: false,
      deleteDialog: false,
      label: '',
      mdiMenu,
      mdiPencil,
      mdiTrashCanOutline
    };
  },
  computed: {
    effect(): string | undefined {
      return this.value?.rule?.effect;
    }
  },
  watch: {
    customTranslations: {
      immediate: true,
      handler() {
        this.setLabel();
      }
    }
  },
  methods: {
    showEdit() {
      this.editDialog = true;
    },
    showDelete() {
      this.deleteDialog = true;
    },
    onEdit(data: IVeoFormSchemaItemUpdateEvent['data']) {
      this.$emit('update', { formSchemaPointer: this.formSchemaPointer, data } as IVeoFormSchemaItemUpdateEvent);
      this.editDialog = false;
    },
    onDelete() {
      this.$emit('delete', { formSchemaPointer: this.formSchemaPointer } as IVeoFormSchemaItemDeleteEvent);
      this.deleteDialog = false;
    },
    onUpdateCustomTranslation(event: IVeoFormSchemaTranslationCollection) {
      this.$emit('update-custom-translation', event);
    },
    setLabel() {
      this.label = (this.name && this.customTranslations?.[this.language][this.name]) || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.fse-label {
  min-width: 250px;
  overflow: hidden;

  .row {
    flex-wrap: nowrap;

    .col {
      align-items: center;
      display: flex;
      height: 36px;
    }
  }
}
</style>
