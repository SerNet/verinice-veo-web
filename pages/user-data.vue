<!--
   - verinice.veo web
   - Copyright (C) 2022 jae
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
  <BasePage sticky-footer>
    <LayoutHeadline
      class="mb-4"
      :title="t('breadcrumbs.user-data')"
    />


    <i18n-t
      keypath="userDataExport.hint.text"
      tag="p"
      scope="global"
    >
      <template #linebreak>
        <br>
      </template>
    </i18n-t>

    <v-row class="align-start">
      <v-col
        class="mt-4"
        cols="12"
      >
        <UserDataUnitExport />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="d-flex mt-4"
        cols="12"
        md="12"
        lg="6"
      >
        <UserDataAccountExport />
      </v-col>
      <v-col
        class="mt-4"
        cols="12"
        md="12"
        lg="6"
      >
        <UserDataDomainExport />
      </v-col>
    </v-row>
    <v-row class="align-start">
      <v-col
        class="mt-4"
        cols="12"
      >
        <UserDataHistoryExport />
      </v-col>
    </v-row>
  </BasePage>
</template>

<script setup lang="ts">
// i18n message are in global en.json/de.json, because they are used with `<i18n-t>` => compare README
const { t } = useI18n();
</script>
