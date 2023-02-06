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
    v-if="level === 0"
    variant="outlined"
    class="fse-group level-0 fill-width fill-height"
  >
    <div
      v-if="modelValue.elements.length === 0"
      class="dropzone-placeholder"
    >
      <div class="dropzone-placeholder-text subtitle-1">
        {{ t('dropzonePlaceholder') }}
      </div>
    </div>
    <Draggable
      v-model="elements"
      class="dragArea d-flex fill-width fill-height dropzone"
      style="overflow: auto;"
      :class="dynamicClasses"
      handle=".handle"
      :group="{ name: 'g1' }"
      item-key="index"
    >
      <template #item="{ element, index }">
        <component :is="createChild(element, index)" />
      </template>
    </Draggable>
    <slot />
  </v-card>
  <v-card
    v-else
    variant="outlined"
    class="fse-group mx-3 my-2 px-2 pb-2"
  >
    <v-row
      no-gutters
      align="center"
    >
      <v-col cols="auto">
        <v-icon
          size="small"
          class="handle pr-1"
          :icon="mdiMenu"
        />
      </v-col>
      <v-col>
        <div class="text-h5 font-weight-regular text-truncate">
          {{ t('group') }}
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
          :icon="mdiPencil"
          size="small"
          variant="text"
          @click="editDialogVisible = true"
        />
        <v-btn
          :icon="mdiTrashCanOutline"
          size="small"
          variant="text"
          @click="deleteDialogVisible = true"
        />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <div
          v-if="label"
          class="text-subtitle-1 mb-2"
        >
          {{ label }}
        </div>
        <Draggable
          v-model="elements"
          class="dragArea d-flex"
          style="overflow: auto; min-width:300; min-height:100px"
          :class="dynamicClasses"
          handle=".handle"
          item-key="index"
          :group="{ name: 'g1' }"
        >
          <template #item="{ element, index }">
            <component :is="createChild(element, index)" />
          </template>
        </Draggable>
      </v-col>
    </v-row>
    <EditorFormSchemaEditGroupDialog
      v-bind="props"
      v-model="editDialogVisible"
      :form-schema="modelValue"
      :name="name"
      @edit="onEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <EditorFormSchemaDeleteDialog
      v-model="deleteDialogVisible"
      @delete="onDelete"
    />
  </v-card>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { mdiMenu, mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import Draggable from 'vuedraggable';

import { IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';
import { omit } from 'lodash';

const props = defineProps({
  modelValue: {
    type: Object,
    default: undefined
  },
  name: {
    type: String,
    default: undefined
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
  level: {
    type: Number,
    default: undefined
  },
  language: {
    type: String,
    required: true
  },
  createFunction: {
    type: Function,
    required: true
  }
});
const emit = defineEmits(['update', 'delete', 'update-custom-translation', 'update:model-value']);

const { t } = useI18n();

const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);

const label = ref('');

const createChild = (element, index) => props.createFunction(element, `${props.formSchemaPointer}/elements/${index}`, props.level + 1);


const directionClass = computed(() => {
  // TODO: this.options does not trigger this computed property, when data is updated.
  if (props.modelValue.options && props.modelValue.options.direction === 'horizontal') {
    return 'flex-row direction-horizontal';
  } else {
    return 'flex-column direction-vertical';
  }
});
const dynamicClasses = computed(() => {
  return [directionClass.value];
});
const effect = computed(() => {
  return props.modelValue?.rule?.effect;
});

const elements = computed({
  get() {
    return props.modelValue.elements.map((item, index) => ({ ...item, index }));
  },
  set(newValue) {
    emit('update:model-value', { ...props.modelValue, elements: newValue.map((element) => omit(element, 'index', 'formSchemaPointer')) });
  }
});

const onEdit = (data: IVeoFormSchemaItemUpdateEvent['data']) => {
  emit('update', { formSchemaPointer: props.formSchemaPointer, data } as IVeoFormSchemaItemUpdateEvent);
  editDialogVisible.value = false;
};

const onDelete = () => {
  emit('delete', { formSchemaPointer: props.formSchemaPointer } as IVeoFormSchemaItemDeleteEvent);
  deleteDialogVisible.value = false;
};

const onUpdateCustomTranslation = (event: IVeoFormSchemaTranslationCollection) => {
  emit('update-custom-translation', event);
};

const setLabel = () => {
  label.value = (props.name && props.customTranslations?.[props.language][props.name]) || '';
};

watch(() => props.customTranslations, () => setLabel(), { immediate: true});
</script>

<i18n>
{
  "en": {
    "dropzonePlaceholder": "Drag in the elements",
    "group": "Group"
  },
  "de": {
    "dropzonePlaceholder": "Ziehen Sie die Steuerelemente herein",
    "group": "Gruppe"
  }
}
</i18n>

<style lang="scss" scoped>
.dropzone-placeholder {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.dropzone-placeholder-text {
  text-align: center;
  color: $medium-grey;
}

.level-0 {
  border: 0;
}
</style>
