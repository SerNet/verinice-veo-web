<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <v-list-item class="bg-basepage" lines="two">
    <v-list-item-title class="body-1 font-weight-bold d-flex align-center">
      {{ idWithTitle }}
    </v-list-item-title>
    <v-list-item-subtitle>{{ t('attributecount', item.attributes.length || 0) }}</v-list-item-subtitle>
    <template #append>
      <v-chip v-if="styling.name" :color="styling.color" class="mr-2" small label variant="outlined">
        <span v-if="translate">
          {{ t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else-if="styling.name">
          {{ upperFirst(styling.name) }}
        </span>
      </v-chip>
      <v-list-item-action class="ml-0 d-flex flex-row">
        <v-btn class="edit-button" :icon="mdiPencil" variant="text" @click="$emit('edit-item', $event)" />
        <v-btn class="delete-button" :icon="mdiTrashCanOutline" variant="text" @click="$emit('delete-item', $event)" />
      </v-list-item-action>
    </template>
  </v-list-item>
</template>
<script setup lang="ts">
import { upperFirst } from 'lodash';
import { mdiPencil, mdiTrashCanOutline } from '@mdi/js';

import type { IVeoOSHCustomAspect, IVeoOSHCustomLink } from '~/lib/ObjectSchemaHelper2';
import type ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import type { IInputType } from '~/types/VeoEditor';

interface Props {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink;
  styling?: Partial<IInputType>;
  translate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  styling: () => ({}),
  translate: false
});

defineEmits<{ 'delete-item': [event: Event]; 'edit-item': [event: Event] }>();

const { t, locale } = useI18n();
const objectSchemaHelper: Ref<ObjectSchemaHelper | undefined> | undefined = inject('objectSchemaHelper');
const displayLanguage = inject<Ref<string>>('displayLanguage', locale);

const translatedTitle = computed(() =>
  objectSchemaHelper?.value?.getTranslation(displayLanguage.value, `${props.item.prefix}${props.item.title}`)
);

const idWithTitle = computed(() =>
  translatedTitle.value ? `${props.item.title} (${locale.value}: ${translatedTitle.value})` : props.item.title
);
</script>

<i18n src="~/locales/base/components/editor-object-schema-list-header.json"></i18n>
