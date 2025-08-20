<template>
  <BasePage sticky-footer>
    <template v-if="showAccessGroupsFeature">
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
import { hasFeature } from '~/utils/featureFlags';

const { t } = useI18n();

const showAccessGroupsFeature = hasFeature('accessGroups');

const tabIndex = ref(0);
</script>

<i18n src="~/locales/base/pages/administration.json"></i18n>
