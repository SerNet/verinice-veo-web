<!--
   - verinice.veo web
   - Copyright (C) 2024  jae
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
  <BasePage data-component-name="unit-selection-page" sticky-footer>
    <LayoutHeadline :title="currentUnit?.name" :element="t('profiles')" />

    <ProfileProfiles ref="profilesRef" />

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn to="/units" size="large" class="my-6">
          {{ globalT('global.button.back') }}
        </v-btn>
        <v-btn
          :disabled="!profilesRef?.canApplyProfile"
          color="primary"
          :prepend-icon="mdiShapeOutline"
          size="large"
          @click="profilesRef?.applyProfile()"
          class="my-6"
        >
          {{ t('applyProfiles') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'profiles';
</script>

<script setup lang="ts">
import { mdiShapeOutline } from '@mdi/js';

const profilesRef = ref<{ applyProfile(): () => void; canApplyProfile: boolean } | null>(null);
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const { data: currentUnit } = useCurrentUnit();

useHead({
  title: globalT('breadcrumbs.profiles')
});
</script>

<i18n>
{
  "en": {
    "profiles": "Profiles",
    "applyProfiles": "Apply Profiles",
    "active": "active",
    "createUnit": "Create Unit",
    "deleteUnit": "Delete Unit",
    "editUnit": "Edit Unit",
    "exceeded": "You have reached the maximum amount of Units",
    "management": "Unit management",
    "of": "of"
  },
  "de": {
    "profiles": "Profile",
    "applyProfiles": "Profile anwenden",
    "active": "aktiv",
    "createUnit": "Unit erstellen",
    "deleteUnit": "Unit löschen",
    "editUnit": "Unit bearbeiten",
    "exceeded": "Sie haben die maximale Anzahl an Units erreicht",
    "management": "Unit-Verwaltung",
    "of": "von"
  }
}
</i18n>
