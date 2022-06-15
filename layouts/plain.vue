<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <v-app>
    <v-app-bar
      class="veo-app-bar"
      app
      flat
    >
      <div
        class="d-flex align-end ml-4"
        style="min-height: 65px;"
      >
        <nuxt-link
          to="/"
          class="text-decoration-none"
        >
          <VeoAppBarLogo
            style="height: 64px"
            class="d-flex align-center"
          />
        </nuxt-link>
      </div>
      <v-spacer />
      <VeoLanguageSwitch class="mx-3" />
      <VeoAppAccountBtn
        v-if="$user.auth.profile"
        :username="$user.auth.profile.username"
        :prename="$user.auth.profile.firstName"
        :lastname="$user.auth.profile.lastName"
        :email="$user.auth.profile.email"
        @logout="$user.auth.logout('/')"
      />
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  head() {
    return {
      titleTemplate: '%s - verinice.veo'
    };
  }
});
</script>
<style lang="scss" scoped>
.veo-app-bar {
  background-color: $background-accent !important;
  border-bottom: 1px solid $medium-grey;

  ::v-deep.v-toolbar__content {
    padding-left: 0;
  }
}

::v-deep.v-main > .v-main__wrap {
  background: $background-primary;
}

::v-deep.v-main > .v-main__wrap {
  display: flex;
  flex-direction: column;
}
</style>
