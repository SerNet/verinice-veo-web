<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Philipp Ballhausen, Davit Svandize, Jonas Heitmann, Annemarie Bufe
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
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xs"
        @click="drawer = true"
      />
      <v-spacer />
      <v-btn
        depressed
        to="/docs?print"
        color="primary"
        class="mr-2"
      >
        Print
      </v-btn>
      <VeoLanguageSwitch />
    </v-app-bar>
    <v-navigation-drawer
      :width="290"
      app
      class="veo-docs-navigation"
      floating
      v-on="$listeners"
    >
      <div style="min-height: 65px">
        <nuxt-link
          to="/docs"
          class="text-decoration-none"
        >
          <VeoAppBarLogo />
        </nuxt-link>
      </div>
      <v-treeview
        dense
        :items="items"
        activatable
        color="white"
        item-key="to"
        open-on-click
        @update:active="openItem"
      />
    </v-navigation-drawer>
    <v-main
      style="max-height: 100vh;"
      class="overflow-hidden"
    >
      <v-divider class="mx-4" />
      <VeoPageWrapper>
        <nuxt />
      </VeoPageWrapper>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, useContext } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useDocTree } from '~/composables/docs';

export default defineComponent({
  setup() {
    const { app } = useContext();
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);

    const items = useDocTree({
      childrenKey: 'children',
      buildItem(item) {
        return {
          ...item,
          disabled: false,
          name: `${item.isDir ? upperFirst(item.dir.split('/').pop()) : item.title || upperFirst(item.slug)}`,
          exact: true,
          to: `/docs${item.path}`
        };
      }
    });

    const openItem = (items: string[]) => {
      const item = items.shift();
      if (item) {
        app.router?.push(item);
      }
    };

    return {
      openItem,
      drawer,
      items
    };
  },
  head() {
    return {
      titleTemplate: '%s - verinice.veo'
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-app-bar {
  background-color: $background-primary !important;
}

::v-deep.v-main > .v-main__wrap {
  background: $background-primary;
  display: flex;
  flex-direction: column;
}

.veo-docs-navigation.v-navigation-drawer {
  background-color: #1b1b1b;

  .v-treeview,
  .v-treeview ::v-deep.v-icon {
    color: #ffffff;
  }
}
</style>
