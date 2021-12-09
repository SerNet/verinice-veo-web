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
    <template #default>
      <p>Filter is visible: {{ filterIsVisible }}</p>
      <p class="mb-6">{{ filter }}</p>
      <v-btn @click="filterIsVisible = !filterIsVisible">Liste filtern</v-btn>
      <VeoFilterDialog
        v-model="filterIsVisible"
        :filter.sync="filter"
        object-type-required
        domain="8b400ad5-d623-43ef-87bd-9daf7f705d12"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const filter = ref({});
    const filterIsVisible = ref(false);

    return {
      filter,
      filterIsVisible
    };
  }
});
</script>

