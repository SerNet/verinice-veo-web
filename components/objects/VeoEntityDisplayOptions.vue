<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <v-row
    v-if="!hideDisplayOptions"
    class="justify-space-between"
  >
    <v-col cols="auto">
      <v-row>
        <v-col>
          <v-btn-toggle
            mandatory
            :value="activeView"
            color="primary"
            dense
          >
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn
                  v-on="on"
                  @click="onNavigate('list')"
                >
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('breadcrumbs.list_view') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn
                  v-on="on"
                  @click="onNavigate('tree')"
                >
                  <v-icon>mdi-file-tree</v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('breadcrumbs.tree_view') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn
                  :disabled="!currentEntity"
                  v-on="on"
                  @click="onNavigate('edit')"
                >
                  <v-icon>mdi-file</v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('breadcrumbs.detail_view') }}
              </template>
            </v-tooltip>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      cols="auto"
      class="mr-4 d-flex flex-grow-1 justify-end"
    >
      <slot />
    </v-col>
  </v-row>
  <v-row v-else>
    <slot />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { IVeoEntity } from '~/types/VeoTypes';

export const COMPONENT_NAME_VIEW_MAP: { [key: string]: number } = { list: 0, tree: 1, edit: 2 };

export default Vue.extend({
  props: {
    currentEntity: {
      type: Object as Prop<undefined | IVeoEntity>,
      default: undefined
    },
    rootRoute: {
      type: String,
      required: true
    },
    hideDisplayOptions: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    activeView(): number {
      const routeComponents = this.$route.path.split('/');
      const componentName = routeComponents[routeComponents.length - 1];

      return COMPONENT_NAME_VIEW_MAP[componentName] || -1;
    }
  },
  methods: {
    onNavigate(to: 'list' | 'tree' | 'edit') {
      this.$router.push(`${this.rootRoute}/${this.$route.params.entity}/${to}`);
    }
  }
});
</script>