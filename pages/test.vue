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
  <div>
    <VeoNestedMenu :items="items">
      <template
        #activator="{ on }"
      >
        <v-btn v-on="on">
          Aktionen
          <v-icon right>
            {{ mdiChevronDown }}
          </v-icon>
        </v-btn>
      </template>
    </VeoNestedMenu>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';
import { mdiChevronDown, mdiClock, mdiPlus } from '@mdi/js';

import { IVeoNestedMenuEntries } from '~/types/VeoTypes';

export default defineComponent({
  setup() {
    const items = ref<IVeoNestedMenuEntries[]>([
      {
        key: 'action-1',
        title: 'Aktion 1 ist lang',
        icon: mdiClock,
        action: () => console.log('foo')
      },
      {
        key: 'risks',
        title: 'Risiken',
        children: [
          {
            key: 'create-risk',
            title: 'Risiko erstellen',
            icon: mdiPlus,
            action: () => console.log('bar')
          }
        ]
      }
    ]);

    return {
      items,

      mdiChevronDown
    };
  }
});
</script>

