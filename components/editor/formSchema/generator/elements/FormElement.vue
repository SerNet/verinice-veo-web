<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
          class="d-flex align-center px-1"
          :class="color"
        >
          <v-icon
            class="handle"
            color="white"
            :icon="mdiMenu"
          />
        </v-col>
        <v-col
          class="mx-2"
          style="overflow: auto"
        >
          <div>
            <div class="text-h5 font-weight-regular">
              {{ label }}
            </div>
            <div class="text-body-2">
              {{ name }}
            </div>
            <div class="text-body-2">
              {{ currentType }}
              <EditorFormSchemaRuleDisplay
                v-if="effect"
                :model-value="effect"
              />
            </div>
          </div>
        </v-col>
        <v-col
          cols="auto"
          class="text-right pr-2"
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
    </v-card-text>
    <EditorFormSchemaEditControlDialog
      v-model="editDialog"
      v-bind="$props"
      :form-schema="modelValue"
      :form-schema-pointer="formSchemaPointer"
      :type="currentType"
      :language="language"
      @edit="doEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <EditorFormSchemaDeleteDialog
      v-model="deleteDialog"
      @delete="doDelete"
    />
  </v-card>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiMenu, mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import { JSONSchema7 } from 'json-schema';
import { UISchemaElement } from '@/types/UISchema';

import { eligibleInputElements, IInputElement, INPUT_TYPES } from '~/types/VeoEditor';
import { IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    schema: {
      type: Object as PropType<JSONSchema7>,
      required: true
    },
    generalTranslation: {
      type: Object as PropType<IVeoTranslationCollection>,
      default: () => ({})
    },
    customTranslations: {
      type: Object as PropType<IVeoFormSchemaTranslationCollection>,
      default: () => ({})
    },
    options: {
      type: Object,
      default: () => ({})
    },
    elements: {
      type: Array as PropType<UISchemaElement[]>,
      default: () => []
    },
    modelValue: {
      type: Object,
      default: undefined
    },
    formSchemaPointer: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    },
    scope: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    }
  },
  emits: ['update', 'delete', 'update-custom-translation'],
  data() {
    return {
      availableElements: [] as IInputElement[],
      editDialog: false as boolean,
      deleteDialog: false as boolean,
      label: '' as string,
      mdiMenu,
      mdiPencil,
      mdiTrashCanOutline
    };
  },
  computed: {
    color(): string {
      return INPUT_TYPES[this.type].color;
    },
    currentType(): string {
      return this.availableElements[0]?.name || 'Unknown';
    },
    type(): string {
      return Array.isArray(this.schema.enum) ? 'enum' : this.schema.type && !Array.isArray(this.schema.type) ? this.schema.type : 'default';
    },
    effect(): string | undefined {
      return this.value?.rule?.effect;
    }
  },
  watch: {
    name() {
      this.availableElements = eligibleInputElements(this.type, this.$props);
      this.setLabel();
    },
    options() {
      this.availableElements = eligibleInputElements(this.type, this.$props);
    },
    generalTranslation() {
      this.setLabel();
    },
    customTranslations() {
      this.setLabel();
    }
  },
  mounted() {
    this.availableElements = eligibleInputElements(this.type, this.$props);
    this.setLabel();
  },
  methods: {
    showEdit() {
      this.editDialog = true;
    },
    doEdit(data: IVeoFormSchemaItemUpdateEvent['data']) {
      this.$emit('update', { formSchemaPointer: this.formSchemaPointer, data } as IVeoFormSchemaItemUpdateEvent);
      this.editDialog = false;
    },
    showDelete() {
      this.deleteDialog = true;
    },
    doDelete() {
      this.$emit('delete', { formSchemaPointer: this.formSchemaPointer } as IVeoFormSchemaItemDeleteEvent);
      this.deleteDialog = false;
    },
    setLabel(): void {
      this.label = this.customTranslations?.[this.language][this.name] || this.generalTranslation?.[this.name] || this.name;
    },
    onUpdateCustomTranslation(event: IVeoFormSchemaTranslationCollection) {
      this.$emit('update-custom-translation', event);
    }
  }
};
</script>

<style lang="scss" scoped>
.fse-generator-element {
  min-width: 300px;
}
</style>
