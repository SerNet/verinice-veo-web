<!--
   - verinice.veo web
   - Copyright (C) 2026 Djordje Mirosavljevic
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage sticky-footer>
    <template v-if="showAccessGroupsFeature">
      <BaseAlert
        v-if="!hasRestrictedUnitAccess"
        :title="t('allUsersHaveAccessHint')"
        :model-value="true"
        :type="VeoAlertType.INFO"
        class="d-flex align-center"
        no-close-button
        flat
      />

      <Tabs v-model="tabIndex" fullsize>
        <template #tabs>
          <v-tab
            ><span>{{ t('accounts') }}</span>
          </v-tab>
          <v-tab
            ><span>{{ t('accessGroups') }}</span>
          </v-tab>
        </template>

        <template #items>
          <v-window-item :value="0">
            <AccountTab />
          </v-window-item>

          <v-window-item :value="1">
            <AccessGroupsTab />
          </v-window-item>
        </template>
      </Tabs>
    </template>
    <template v-else>
      <AccountTab />
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import Tabs from '~/components/base/Tabs.vue';
import AccessGroupsTab from '~/components/accessGroups/AccessGroupsTab.vue';
import AccountTab from '../components/account/AccountTab.vue';
import accessGroupsDefinition from '~/composables/api/queryDefinitions/accessGroups';
import { hasFeature } from '~/utils/featureFlags';
import { VeoAlertType } from '~/types/VeoTypes';
import { useQuery } from '~/composables/api/utils/query';

const { t } = useI18n();
const { data: clientConfig } = useQuery(accessGroupsDefinition.queries.isRestrictUnitAccess);

const showAccessGroupsFeature = hasFeature('accessGroups');
const tabIndex = ref(0);

const hasRestrictedUnitAccess = computed(() => clientConfig.value?.restrictUnitAccess ?? true);
</script>

<i18n src="~/locales/base/pages/administration.json"></i18n>
