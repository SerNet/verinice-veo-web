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
        <tr
          v-for="(revision, key) in revisions || []"
          :key="key"
          class="text-no-wrap overflow-x-hidden fill-width"
        >
          <td>
            <nuxt-link
              :to="createUrl(revision)"
              class="text-body-2"
            >
              {{ revision.content.designator }} <b>{{ revision.content.abbreviation }} {{ revision.content.name }}</b>
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

<script lang="ts">
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import historyQueryDefinitions from '~/composables/api/queryDefinitions/history';
import { IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import { useQuery } from '~~/composables/api/utils/query';

export default defineComponent({
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();

    const latestChangesQueryParameters = computed(() => ({ unitId: route.params.unit as string }));
    const { data: revisions } = useQuery(historyQueryDefinitions.queries.fetchLatestVersions, latestChangesQueryParameters);

    const fetchFormsQueryParameters = computed(() => ({ domainId: route.params.domain as string }));
    const fetchFormsQueryEnabled = computed(() => !!route.params.domain);
    const { data: forms } = useQuery(formQueryDefinitions.queries.fetchForms, fetchFormsQueryParameters, { enabled: fetchFormsQueryEnabled });

    const createUrl = (revision: IVeoObjectHistoryEntry) =>
      `/${route.params.unit}/domains/${route.params.domain}/objects/${revision.content.id}/`;

    return {
      createUrl,
      forms,
      revisions,

      t,
      locale
    };
  }
});
</script>

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

<i18n>
{
  "en": {
    "myLatestRevisions": "My latest edited revisions"
  },
  "de": {
    "myLatestRevisions": "Meine zuletzt bearbeiteten Objekte"
  }
}
</i18n>
