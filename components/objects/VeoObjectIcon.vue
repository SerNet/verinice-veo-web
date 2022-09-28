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
    <v-icon v-bind="$attrs">
      {{ OBJECT_TYPE_ICONS.get(objectType) }}
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

<script lang="ts">
import { mdiAccountOutline, mdiAlarmLightOutline, mdiDevices, mdiDotsHorizontal, mdiFileDocumentOutline, mdiPlaylistCheck, mdiShieldAlertOutline } from '@mdi/js';
import { defineComponent } from '@nuxtjs/composition-api';

export const OBJECT_TYPE_ICONS = new Map<string, string>([
  ['asset', mdiDevices],
  ['person', mdiAccountOutline],
  ['incident', mdiAlarmLightOutline],
  ['document', mdiFileDocumentOutline],
  ['scenario', mdiShieldAlertOutline],
  ['control', mdiPlaylistCheck]
]);

export default defineComponent({
  props: {
    objectType: {
      type: String,
      required: true
    },
    isComposite: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      OBJECT_TYPE_ICONS,
      mdiDotsHorizontal
    };
  }
});
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
