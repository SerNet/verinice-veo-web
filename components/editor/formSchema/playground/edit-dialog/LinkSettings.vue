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
  <div>
    <div class="d-flex flex-row align-center mb-3">
      <v-select
        v-model="usedLinkAttributes"
        data-component-name="form-element-link-settings-available-attributes"
        :label="t('displayedAttributes')"
        :items="availableLinkAttributeUUIDs"
        hide-details
        multiple
        :prepend-inner-icon="mdiListBoxOutline"
        variant="underlined"
      >
        <template #item="{ item, props: itemProps }">
          <v-list-item
            v-bind="itemProps"
            :active="usedLinkAttributes.includes(item.value)"
            :title="undefined"
            style="max-width: 500px"
          >
            <template #prepend>
              <v-icon :icon="usedLinkAttributes.includes(item.value) ? mdiCheckboxMarked : mdiCheckboxBlankOutline" />
            </template>
            <v-list-item-title>
              {{ last(availableLinkAttributes[item.value].scope?.split('/')) }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          {{ last(availableLinkAttributes[item.value].scope?.split('/')) }}
        </template>
      </v-select>
      <v-tooltip location="top">
        <template #activator="{ props: tooltipProps }">
          <v-icon :icon="mdiInformationOutline" size="large" end v-bind="tooltipProps" />
        </template>
        <template #default>
          {{ t('changesVisibleImmediately') }}
        </template>
      </v-tooltip>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiInformationOutline, mdiListBoxOutline } from '@mdi/js';
import { v5 as UUIDv5 } from 'uuid';
import { difference, last } from 'lodash';

import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { FORMSCHEMA_PLAYGROUND_NAMESPACE } from '../Playground.vue';
import type { IPlaygroundElement } from '../Element.vue';
import type { IVeoObjectSchemaCustomLink } from '~/types/VeoTypes';

interface Props {
  formSchemaElement: IVeoFormSchemaItem;
  objectSchemaElement: IVeoObjectSchemaCustomLink;
  playgroundElement: IPlaygroundElement;
  pointer: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'add', pointer: string, element: IVeoFormSchemaItem): void;
  (event: 'remove', pointer: string, removeFromSchemaElementMap?: boolean): void;
}>();

const { t } = useI18n();

const availableLinkAttributes = computed<{
  [uuid: string]: IVeoFormSchemaItem;
}>(() =>
  Object.entries((props.objectSchemaElement.items as any)?.properties?.attributes?.properties || {}).reduce(
    (previous, [key, _attribute]) => {
      const newElement = {
        type: 'Control',
        scope: `${props.formSchemaElement.scope}/items/properties/attributes/properties/${key}`,
        options: {
          label: `#lang/${key}`
        }
      };
      previous[UUIDv5(newElement.scope, FORMSCHEMA_PLAYGROUND_NAMESPACE)] = newElement;
      return previous;
    },
    Object.create({})
  )
);

const availableLinkAttributeUUIDs = computed(() => Object.keys(availableLinkAttributes.value));

const usedLinkAttributes = computed<string[]>({
  get: () => {
    return props.playgroundElement.children.map((child) => child.id);
  },
  set: (newValue) => {
    // New elemnt was added, this is usually app
    if (newValue.length > usedLinkAttributes.value.length) {
      const newElementUUID = difference(newValue, usedLinkAttributes.value)[0];
      emit('add', `${props.pointer}/children/${newValue.length - 1}`, availableLinkAttributes.value[newElementUUID]);
    } else {
      const deleteIndex = usedLinkAttributes.value.findIndex((uuid) => !newValue.includes(uuid));
      emit('remove', `${props.pointer}/children/${deleteIndex}`);
    }
  }
});
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-edit-dialog-link-settings.json"></i18n>
