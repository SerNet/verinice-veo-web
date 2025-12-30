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
  <v-tooltip location="bottom" :aria-label="t('showHelp')" open-on-hover>
    <template #activator="{ props: tooltipProps }">
      <div>
        <v-btn
          v-if="tutorialsForRoute.length <= 1"
          icon
          type="submit"
          :disabled="!tutorialsForRoute.length"
          data-component-name="tutorial-select"
          v-bind="tooltipProps"
          :aria-label="t('showHelp')"
          :title="t('showHelp')"
          @click="visible ? stop() : load()"
        >
          <v-icon :icon="visible ? mdiInformationOffOutline : mdiInformationOutline" />
        </v-btn>
        <v-menu v-else offset-y bottom left nudge-bottom="2">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              data-component-name="tutorial-select"
              :aria-label="t('showHelp')"
              v-bind="{ ...tooltipProps, ...menuProps }"
            >
              <v-icon :icon="visible ? mdiInformationOffOutline : mdiInformationOutline" />
            </v-btn>
          </template>
          <template #default>
            <v-list dense>
              <v-list-item v-for="tutorial of tutorialsForRoute" :key="tutorial.id" @click="load(tutorial.path)">
                <v-list-item-title>
                  {{ tutorial?.['title'] ?? '' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </template>
        </v-menu>
      </div>
    </template>
    <span v-text="t(visible ? 'hideHelp' : 'showHelp')"></span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { mdiInformationOffOutline, mdiInformationOutline } from '@mdi/js';
import { useTutorials } from '~/composables/intro';
const { load, stop, tutorialsForRoute, visible } = useTutorials();
const { t } = useI18n();
</script>

<i18n src="~/locales/base/components/layout-tutorial-button.json"></i18n>
