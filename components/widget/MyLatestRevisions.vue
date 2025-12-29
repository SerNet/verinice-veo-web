<!--
   - verinice.veo web
   - Copyright (C) 2021  Jessica Lühnen, Annemarie Bufe, Jonas Heitmann
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
  <BaseWidget :title="t('myLatestRevisions')">
    <v-table dense>
      <tbody>
        <tr v-for="(revision, key) in revisions || []" :key="key" class="text-no-wrap overflow-x-hidden fill-width">
          <td>
            <nuxt-link :to="createUrl(revision)" class="text-body-2 text-color">
              {{ revision.content.designator }}
              <b>{{ revision.content.abbreviation }} {{ revision.content.name }}</b>
            </nuxt-link>
          </td>
          <td class="text-right text-body-2">
            {{ new Date(revision.time).toLocaleString(locale) }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </BaseWidget>
</template>

<script setup lang="ts">
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IVeoLegacyObjectHistoryEntry } from '~/types/history';

const { t, locale } = useI18n();

const { data: revisions } = useLatestRevisions();

const createUrl = (revision: IVeoLegacyObjectHistoryEntry) => {
  const unitId = revision.content?.owner?.id;
  // for now we assume, the object is associated to a single domain. So we pick the first and only one
  const domainIdContainingObject = Object.keys(revision.content?.domains)?.[0];
  const objectType = VeoElementTypePlurals[revision.content?.type];
  const subType = revision.content?.domains?.[domainIdContainingObject]?.subType || '-';
  const objectId = revision.content?.id;

  return `/${unitId}/domains/${domainIdContainingObject}/${objectType}/${subType}/${objectId}/`;
};
</script>

<i18n src="~/locales/base/components/widget-my-latest-revisions.json"></i18n>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }

  td {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.v-data-table {
  background: transparent;
}
</style>
