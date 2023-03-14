<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <section class="mt-4">
    <h2 class="text-h2">
      {{ t('conditionalVisibility') }}
    </h2>
    <BaseCard>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-select
              :label="t('effect')"
              :items="options"
              clearable
              :prepend-inner-icon="mdiMagicStaff"
              variant="underlined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </BaseCard>
  </section>
</template>

<script setup lang="ts">
import { mdiMagicStaff } from '@mdi/js';

const { t } = useI18n();

const options = computed(() => [
  {
    title: t('hide'),
    value: 'HIDE'
  },
  {
    title: t('show'),
    value: 'SHOW'
  }
]);
</script>

<i18n>
{
  "en": {
    "conditionalVisibility": "Conditional visibility",
    "effect": "Effect",
    "hide": "Hide if rule applies",
    "show": "Show if rule applies"
  },
  "de": {
    "conditionalVisibility": "Bedingte Sichtbarkeit",
    "effect": "Effekt",
    "hide": "Ausblenden falls Regel zutrifft",
    "show": "Anzeigen falls Regel zutrifft"
  }
}
</i18n>
