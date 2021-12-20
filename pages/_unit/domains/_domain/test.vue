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
  <VeoPage title="Testseite">
    <v-row class="flex-column">
      <v-col>
        <VeoFilterDialog
          v-model="showFilter"
          :filter.sync="filter"
          :domain="domainId"
          :object-type-required="objectTypeRequired"
        />
        <v-btn @click="showFilter = !showFilter">Filter anzeigen</v-btn><br>
        <v-switch v-model="objectTypeRequired" label="Objekttyp verpflichtend" />
        <p>Filter Dialog wird angezeigt: {{ showFilter }}</p>
        <p>Angewendete Filter: {{ filter }}</p>
      </v-col>
    </v-row>
  </VeoPage>
</template>

<script>
import { defineComponent, ref, computed, useRoute } from '@nuxtjs/composition-api'
import { separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  setup() {
    const showFilter = ref(false);
    const objectTypeRequired = ref(false);
    const filter = ref({});
    const route = useRoute();

    const domainId = computed(() => {
      return separateUUIDParam(route.value.params.id);
    })

    return { showFilter, filter, objectTypeRequired, domainId };
  },
})
</script>
