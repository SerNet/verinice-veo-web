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
  <div class="veo-object-icon__outer">
    <font-awesome-icon
      v-if="icon && icon.library === 'fa'"
      color="grey"
      v-bind="$attrs"
      :icon="icon.icon"
    />
    <v-icon
      v-else-if="icon && icon.library === 'mdi'"
      v-bind="$attrs"
    >
      {{ icon.icon }}
    </v-icon>
    <v-icon
      v-if="isComposite"
      class="veo-object-icon--composite"
      color="primary"
    >
      {{ mdiDotsHorizontal }}
    </v-icon>
  </div>
</template>

<script lang="ts" setup>
import { mdiAccountOutline, mdiAlarmLightOutline, mdiDevices, mdiDotsHorizontal, mdiFileDocumentOutline, mdiPlaylistCheck, mdiShieldAlertOutline } from '@mdi/js';

const props = defineProps({
  objectType: {
    type: String,
    required: true
  },
  isComposite: {
    type: Boolean,
    default: false
  }
});

const icon = computed(() => OBJECT_TYPE_ICONS.get(props.objectType));
</script>

<script lang="ts">
export const OBJECT_TYPE_ICONS = new Map<string, { icon: string | string[]; library: 'fa' | 'mdi' }>([
  ['scope', { icon: ['far', 'object-group'], library: 'fa' }],
  ['process', { icon: ['fas', 'diagram-project'], library: 'fa' }],
  ['asset', { icon: mdiDevices, library: 'mdi' }],
  ['person', { icon: mdiAccountOutline, library: 'mdi' }],
  ['incident', { icon: mdiAlarmLightOutline, library: 'mdi' }],
  ['document', { icon: mdiFileDocumentOutline, library: 'mdi' }],
  ['scenario', { icon: mdiShieldAlertOutline, library: 'mdi' }],
  ['control', { icon: mdiPlaylistCheck, library: 'mdi' }]
]);
</script>

<style lang="scss" scoped>
.veo-object-icon__outer {
  position: relative;
  width: 27px;
}

.veo-object-icon--composite {
  bottom: -50%;
  position: absolute;
  right: 28%;
}
</style>
