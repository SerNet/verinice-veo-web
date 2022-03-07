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
  <h1>Hello world</h1>
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    useFetch(async () => {
      const { $api } = useContext();

      const domains = await $api.domain.fetchAll();

      console.log('Domains:', domains);

      for (const domain of domains) {
        console.log('Forms for domain', domain.id, ':', await $api.form.fetchAll(domain.id));
      }
    });

    return {};
  }
});
</script>

