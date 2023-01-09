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
  <v-tooltip bottom>
    <template #activator="{ props, attrs }">
      <div v-bind="props">
        <v-btn
          v-if="tutorialsForRoute.length <= 1"
          color="black"
          icon
          role="submit"
          type="submit"
          :disabled="!tutorialsForRoute.length"
          v-bind="attrs"
          data-component-name="tutorial-select"
          @click="visible ? stop(): load()"
        >
          <!--<v-icon :icon="`mdiSvg:${visible ? mdiInformationOffOutline : mdiInformationOutline}`" />-->
        </v-btn>
        <v-menu
          v-else
          offset-y
          bottom
          left
          nudge-bottom="2"
        >
          <template #activator="{props: menu }">
            <v-btn
              color="black"
              icon
              data-component-name="tutorial-select"
              v-bind="menu"
            >
              <!--<v-icon :icon="`mdiSvg:${visible ? mdiInformationOffOutline : mdiInformationOutline}`" />-->
            </v-btn>
          </template>
          <template #default>
            <v-list dense>
              <v-list-item
                v-for="tutorial of tutorialsForRoute"
                :key="tutorial.slug"
                @click="load(tutorial.path)"
              >
                <v-list-item-title>
                  {{ tutorial.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </template>
        </v-menu>
      </div>
    </template>
    <span v-text="t(visible?'hideHelp':'showHelp')" />
  </v-tooltip>
</template>

<script lang="ts">
import { mdiInformationOffOutline, mdiInformationOutline } from '@mdi/js';

import { useTutorials } from '~/composables/intro';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const { load, stop, tutorialsForRoute, visible } = useTutorials();

    return {
      load,
      stop,
      tutorialsForRoute,
      visible,

      mdiInformationOffOutline,
      mdiInformationOutline,
      t
    };
  }
});
</script>

<i18n>
{
  "de": {
    "showHelp": "Kontext-Hilfe anzeigen",
    "hideHelp": "Kontext-Hilfe ausblenden"
  },
  "en": {
    "showHelp": "Show contextual help",
    "hideHelp": "Hide contextual help"
  }
}
</i18n>
