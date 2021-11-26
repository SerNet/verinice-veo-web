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
flat>
      <div class="d-flex align-center fill-height">
        <v-app-bar-nav-icon
v-if="$vuetify.breakpoint.xs"
@click="drawer = true" />
        <nuxt-link
to="/docs"
class="text-decoration-none fill-height">
          <VeoAppBarLogo class="ml-2" />
        </nuxt-link>
        <div class="ml-4">
          <VeoDomainSelect v-if="$route.params.unit" />
        </div>
      </div>
      <div class="d-flex flex-grow-0 mr-6">
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
v-bind="attrs"
outlined
color="primary"
v-on="on">
              <v-icon
left
dark>mdi-earth</v-icon>
              {{ $i18n.locale.toUpperCase() }}
              <v-icon
right
dark>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item-group
v-model="lang"
color="primary">
              <v-list-item
v-for="(item) in langs"
:key="item.text"
:value="item.value">
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </div>
      <span />
    </v-app-bar>
    <VeoPrimaryNavigationSimple
v-model="drawer"
:items="items">
      <div>Dies ist ein Test</div>
    </VeoPrimaryNavigationSimple>
    <v-main
style="max-height: 100vh;"
class="overflow-hidden">
      <VeoPageWrapper>
        <nuxt />
      </VeoPageWrapper>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, useContext, useAsync } from '@nuxtjs/composition-api';
import { FetchReturn } from '@nuxt/content/types/query-builder';

export default defineComponent({
  setup() {
    const { app, $content } = useContext();

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

    const items = useAsync(async () => {
      const items = await $content({ deep: true })
        .where({ hidden: { $ne: true } })
        .sortBy('dir', 'asc')
        .fetch<{ title: string; position: number }>();
      if (!Array.isArray(items)) return;
      console.log('L', items);

      /*
      const toArray = (tree: Map<string, any>, level = 0): Array<any> => {
        return Array.from(tree.entries()).map(([key, value]) => {
          const isFolder = value instanceof Map;
          const index = isFolder ? value.get(key.replace(/\/?$/, '/index')) : {};
          return {
            ...index,
            title: index.name,
            topLevelItem: level === 0,
            children: isFolder ? toArray(value, level + 1) : [],
            to: `/docs${index?.path || ''}`
          };
        });
      };
      const tree = items.reduce((tree, item) => {
        const dir = item.path.endsWith('/index') ? item.path.replace(/(\/[^/]+)?\/index$/, '') || '/' : item.dir;
        console.log(item.path, dir);
        let parent = tree.get(dir);
        if (!parent) {
          parent = new Map();
          tree.set(dir, parent);
        }
        parent.set(item.path, item);
        return tree;
      }, new Map());

      console.log(tree);
      // return toArray(tree);
      */

      const fileMap = new Map(
        items.map((item) => [
          item.path,
          {
            ...item,
            position: item.position ?? -Infinity,
            name: item.title || item.slug,
            childItems: [] as typeof items,
            to: '/docs' + item.path,
            disabled: false,
            topLevelItem: false
          }
        ])
      );
      const topLevelItems: any[] = [];
      const freezed = Array.from(fileMap.values());
      freezed.forEach((file) => {
        const paths = file.path
          .replace(/\/index$/, '')
          .split('/')
          .slice(0, -1);
        const parentPath = paths.join('/') || '/';

        console.log(file.path, parentPath);
        let parent = fileMap.get(parentPath);
        if (!parent) {
          // index file missing in folder
          console.log('CREATE VIRTUAL FOLDER', file.path);
          parent = {
            ...file,
            path: parentPath,
            dir: parentPath,
            name: 'Virtual Node',
            to: parentPath,
            childItems: [] as typeof items,
            disabled: false,
            topLevelItem: file.dir === '/'
          };
          fileMap.set(parentPath, parent);
        }
        parent.childItems.push(file);
        if (paths.length < 2) {
          topLevelItems.push(file);
        }
      });

      topLevelItems?.sort?.((a, b) => b.position - a.position || String(a.path).localeCompare(b.path));
      fileMap.forEach((items) => items.childItems?.sort?.((a, b) => b.position - a.position || String(b.path).localeCompare(a.path)));

      console.log(topLevelItems);
      return topLevelItems;
    });

    return {
      domainId,
      drawer,
      lang,
      langs,
      items
    };
  },
  head() {
    return {
      titleTemplate: '%s - verinice.'
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
