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
  <v-list-item :lines="lines">
    <template v-if="styling" #prepend>
      <v-avatar :color="styling.color">
        <v-icon size="small" :icon="styling.icon" color="white" />
      </v-avatar>
    </template>
    <v-list-item-title class="caption">{{ sanitizedTitle }}</v-list-item-title>
    <v-list-item-subtitle v-if="scope">
      {{ pointer }}
    </v-list-item-subtitle>
    <slot name="description" />
    <template #append>
      <v-list-item-action class="ml-3">
        <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>
          <span v-if="translate">
            {{ t(`editor.inputtypes.${styling.name}`) }}
          </span>
          <span v-else>
            {{ styling.name }}
          </span>
        </v-chip>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { upperFirst } from 'lodash';
import { IInputType } from '~/types/VeoEditor';

interface Props {
  scope?: string;
  title: string;
  lines?: 'one' | 'two' | 'three';
  styling: IInputType;
  translate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  scope: undefined,
  title: undefined,
  lines: 'one',
  styling: () => ({}) as IInputType,
  translate: false
});

const sanitizedTitle: ComputedRef<string> = computed(() => {
  if (te(props.title)) {
    return t(props.title);
  }
  return upperFirst(props.title.replace(/([A-Z])/g, ' $1')).trim();
});

const pointer: ComputedRef<string> = computed(() => {
  if (!props.scope) return '';

  return props.scope.replace(/properties\//g, '');
});

const { t, te } = useI18n();
</script>
