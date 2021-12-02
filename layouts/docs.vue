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
:menu-items="items">
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
import { useI18n } from 'nuxt-i18n-composable';
import { listToTree } from '~/lib/docs';

export default defineComponent({
  setup() {
    const { app, $content } = useContext();
    const { locale } = useI18n();

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

    const files = useAsync(async () => {
      const items = await $content({ deep: true })
        .where({ lang: { $undefinedin: [locale.value, undefined] } })
        .sortBy('dir', 'asc')
        .fetch<{ title: string; position: number; lang: string }>();
      if (!Array.isArray(items)) return;
      return items
        .sort((a, b) => ((a.lang || b.lang || locale.value) === locale.value ? 0 : -1)) // Sort documents with matching locale to the end
        .map((item) => {
          const path = item.path.split('.').shift() || item.path; // Remove language extension from path
          return {
            ...item,
            name: item.title || item.slug,
            disabled: false,
            exact: true,
            icon: 'mdi-file',
            to: `/docs${path}`,
            topLevelItem: false,
            path // dont use path as it includes the locale
          };
        });
    });

    const items = computed(() => {
      return files.value
        ? listToTree(files.value, (file) => ({
            ...file,
            name: file.path.split('/').slice(0, -1).pop() || 'Neu'
          }))
        : [];
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
