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
  <VeoDialog
    headline="Objektaktionen"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <v-list>
      <v-list-item
        v-for="action of actions"
        :key="action.title"
        two-line
        @click="$emit('input', false)"
      >
        <v-list-item-title v-text="action.title" />
      </v-list-item>
    </v-list>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const actions = ref([
      {
        title: 'Bestandteil (Scope) erstellen & hinzufügen'
      },
      {
        title: 'Bestandteil (Scope) erstellen'
      },
      {
        title: 'Bestandteil (Objekt) erstellen & hinzufügen'
      },
      {
        title: 'Bestandteil (Objekt) erstellen'
      },
      {
        title: 'Als Bestandteil zu Scope hinzufügen'
      },
      {
        title: 'Als Bestandteil zu Objekt hinzufügen'
      },
      {
        title: 'Risiko erstellen & hinzufügen'
      }
    ]);

    return {
      actions
    };
  }
});
</script>
