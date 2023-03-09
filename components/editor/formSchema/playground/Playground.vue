<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <EditorFormSchemaPlaygroundItem
    v-if="playgroundItems"
    :playground-item="playgroundItems"
  />
</template>

<script lang="ts">
export const FORMSCHEMA_PLAYGROUND_NAMESPACE = 'bdc08095-d80f-4974-aa69-a41d01a66748';

export type FormSchemaItemMap = Map<string, IVeoFormSchemaItem>;

export const PROVIDE_KEYS = {
  formSchemaItemMap: 'formSchemaItemMap'
};
</script>

<script setup lang="ts">
import { PropType } from 'vue';
import { v5 as UUIDv5 } from 'uuid';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { JsonPointer } from 'json-ptr';
import { IPlaygroundItem } from './Item.vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<IVeoFormSchemaItem>,
    default: () => ({
      type: "Layout",
      options: {
        format: "group",
        direction: "vertical"
      },
      elements: []
    })
  }
});

// UUID Map stuff
const formSchemaItemMap = reactive<FormSchemaItemMap>(new Map<string, IVeoFormSchemaItem>());
const playgroundItems = ref<IPlaygroundItem | undefined>(undefined);

provide(PROVIDE_KEYS.formSchemaItemMap, formSchemaItemMap);

const getFormSchemaItemName = (formSchemaItem: IVeoFormSchemaItem, pointer: string) => {
  switch(formSchemaItem.type) {
    case 'Control':
      return formSchemaItem.scope as string;
    case 'Widget':
      return formSchemaItem.name as string;
    default:
      return pointer;
  }
};

const addItemToMap = (formSchemaItem: IVeoFormSchemaItem, pointer: string) => {
  const uuid = UUIDv5(getFormSchemaItemName(formSchemaItem, pointer), FORMSCHEMA_PLAYGROUND_NAMESPACE);
  formSchemaItemMap.set(uuid, formSchemaItem); // Add to formSchema item to uuid map
  if(pointer === '#') {
    playgroundItems.value = { id: uuid, children: [], readonly: true };
  } else {
    JsonPointer.set(playgroundItems.value, pointer, { id: uuid, children: [] }, true); // Add to playground items, to be displayed
  }

  (formSchemaItem.elements || []).forEach((child, childIndex) => {
    addItemToMap(child, `${pointer}/children/${childIndex}`);
  });
};

const initPlayground = (formSchemaRoot: IVeoFormSchemaItem) => {
  formSchemaItemMap.clear();
  addItemToMap(formSchemaRoot, '#');
};
initPlayground(props.modelValue); // Call once as soon as the component gets initialized to create the map
</script>
