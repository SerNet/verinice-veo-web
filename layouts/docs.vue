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
      <div class="d-flex align-center fill-height">
        <v-app-bar-nav-icon
          v-if="$vuetify.breakpoint.xs"
          @click="drawer = true"
        />
        <nuxt-link
          to="/docs"
          class="text-decoration-none fill-height"
        >
          <VeoAppBarLogo class="ml-2" />
        </nuxt-link>
      </div>
      <div class="d-flex flex-grow-0 mr-6">
        <v-btn
          to="/docs?print"
          outlined
          color="primary"
          class="mr-2"
        >
          Print
        </v-btn>
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              outlined
              color="primary"
              v-on="on"
            >
              <v-icon
                left
                dark
              >
                mdi-earth
              </v-icon>
              {{ $i18n.locale.toUpperCase() }}
              <v-icon
                right
                dark
              >
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item-group
              v-model="lang"
              color="primary"
            >
              <v-list-item
                v-for="(item) in langs"
                :key="item.text"
                :value="item.value"
              >
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </div>
      <span />
    </v-app-bar>
    <v-navigation-drawer
      :width="290"
      app
      clipped
      v-on="$listeners"
    >
      <v-treeview
        dense
        :items="items"
        activatable
        item-key="to"
        open-on-click
        @update:active="openItem"
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
import { computed, defineComponent, Ref, ref, useContext } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useDocTree } from '~/composables/docs';

export default defineComponent({
  setup() {
    const { app } = useContext();
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);
    const domainId = ref('');
    const lang = computed({
      get() {
        return app.i18n.locale;
      },
      set(newValue: string) {
        app.i18n.setLocale(newValue);
        // After the language change, reload the page to avoid synchronisation problems
        // Reload here should not be a big problem, because a user will not often change the language
        window.location.reload();
      }
    });
    const langs = ref([
      { value: 'en', text: 'EN' },
      { value: 'de', text: 'DE' }
    ]);

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
      domainId,
      drawer,
      lang,
      langs,
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
@import '~/assets/vuetify.scss';

.veo-app-bar {
  background-color: white !important;
  box-shadow: inset 0 -1px 0 $grey !important;

  .v-toolbar__content {
    > * {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
}
</style>
