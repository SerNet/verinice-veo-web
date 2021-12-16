<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <VeoPage>
    <v-btn @click="showCreateObjectDialog = !showCreateObjectDialog">Prozess erstellen</v-btn>
    <VeoCreateObjectDialog
      v-model="showCreateObjectDialog"
      object-type = "process"
      :domain-id="domainId"
      sub-type="PRO_DataProcessing"
    />
    <p class="mt-4">showCreateObjectDialog: {{ showCreateObjectDialog }}</p>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent, ref, useRoute } from '@nuxtjs/composition-api';
import { separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  setup() {
    const route = useRoute();

    const showCreateObjectDialog = ref(false);
    const domainId = ref(separateUUIDParam(route.value.params.domain).id);

    return {
      showCreateObjectDialog,
      domainId
    };
  }
});
</script>
