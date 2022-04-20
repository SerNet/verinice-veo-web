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
      clipped-left
      flat
    >
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xs"
        @click="drawer = true"
      />
      <nuxt-link
        to="/docs"
        class="text-decoration-none fill-height"
      >
        <VeoAppBarLogo />
      </nuxt-link>
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
      clipped
      floating
      v-on="$listeners"
    >
      <v-treeview
        dense
        :items="items"
        :active="activeItems"
        :open="openItems"
        activatable
        item-key="to"
        open-on-click
        @update:active="onActive"
        @update:open="onOpen"
      />
    </v-navigation-drawer>
    <v-main
      style="max-height: 100vh;"
      class="overflow-hidden"
    >
      <VeoPageWrapper>
        <nuxt />
      </VeoPageWrapper>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, useRouter } from '@nuxtjs/composition-api';
import { last, upperFirst } from 'lodash';
import { useDocTree } from '~/composables/docs';

export default defineComponent({
  setup() {
    const router = useRouter();
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);

    const openItems = ref<string[]>([]);
    const activeItems = ref<string[]>([]);

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

    const onActive = (newActiveItems: string[]) => {
      console.log('event', JSON.stringify(newActiveItems));
      console.log('active', JSON.stringify(activeItems.value));

      if (newActiveItems.length >= activeItems.value.length) {
        activeItems.value = newActiveItems;

        if (activeItems.value[0]) {
          router.push(activeItems.value[0]);
        }
      }
    };

    const onOpen = (newOpenItems: string[]) => {
      const newestItem = last(newOpenItems);
      if (newestItem && !activeItems.value.includes(newestItem)) {
        onActive([newestItem]);
      }
      console.log('event', JSON.stringify(newOpenItems));
      console.log('open', JSON.stringify(openItems.value));
      openItems.value = newOpenItems;
    };

    return {
      activeItems,
      openItems,
      drawer,
      items,
      onActive,
      onOpen
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

::v-deep.v-main {
  background: $background-primary;
}

::v-deep.v-main > .v-main__wrap {
  background: white;
  border-left: 1px solid $medium-grey;
  border-top: 1px solid $medium-grey;
  border-top-left-radius: 32px;
  display: flex;
  flex-direction: column;
}

.veo-docs-navigation.v-navigation-drawer {
  background-color: $background-primary;
}
</style>
