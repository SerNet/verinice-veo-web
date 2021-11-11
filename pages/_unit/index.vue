<!--
   - verinice.veo web
   - Copyright (C) 2021  Philipp Ballhausen, Davit Svandize, Jonas Heitmann, Tino Groteloh
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
  <span />
</template>

<script lang="ts">
import Vue from 'vue';

import { createUUIDUrlParam } from '~/lib/utils';

export default Vue.extend({
  // VEO-692
  middleware({ $user, redirect, params, $api }) {
    if ($user.lastDomain) {
      redirect(`/${params.unit}/domains/${createUUIDUrlParam('domain', $user.lastDomain)}`);
    } else {
      $api.domain.fetchAll().then((domains) => {
        redirect(`/${params.unit}/domains/${createUUIDUrlParam('domain', domains[0].id)}`);
      });
    }
  }
});
</script>
