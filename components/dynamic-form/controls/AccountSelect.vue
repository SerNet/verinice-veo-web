<!--
   - verinice.veo web
   - Copyright (C) 2026 Aziz Khalledi
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
  <v-autocomplete
    v-if="options.visible && canAssignAccounts"
    :id="objectSchemaPointer"
    :model-value="modelValue"
    :disabled="disabled || options.disabled"
    :loading="isFetching"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-account-select"
    :clearable="!options.required"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
    :items="accountItems"
    item-title="username"
    item-value="username"
    :filter-keys="['title', 'raw.fullName']"
    :no-data-text="t('noAccountsFound')"
    autocomplete="off"
    variant="underlined"
    :aria-label="options && options.label"
    @update:model-value="$emit('update:model-value', $event)"
    @click:clear="$emit('update:model-value', undefined)"
  >
    <template #item="{ props: itemProps, item }">
      <v-list-item
        v-bind="itemProps"
        :title="item.username"
        :subtitle="item.fullName"
        data-veo-test="account-select-item"
      />
    </template>
    <template #selection="{ item }">
      <div class="text-truncate">
        <span>{{ item.username }}</span>
        <span v-if="item.fullName" class="text-medium-emphasis"> ({{ item.fullName }})</span>
      </div>
    </template>
  </v-autocomplete>
  <!-- Users without access to the account list may only see the linked username -->
  <v-text-field
    v-else-if="options.visible"
    :id="objectSchemaPointer"
    :model-value="modelValue"
    disabled
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-account-select"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
    variant="underlined"
    :aria-label="options && options.label"
  />
</template>

<script lang="ts">
import { last } from 'lodash';

import type { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { USERNAME_SCOPE } from '../userAssignment';
import accountQueryDefinitions from '~/composables/api/queryDefinitions/accounts';
import { useQuery } from '~/composables/api/utils/query';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { hasFeature } from '~/utils/featureFlags';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-account-select',
  name: {
    en: 'account select',
    de: 'Account-Auswahl'
  },
  description: {
    en: 'Lets the user link an account of the current client to a person.',
    de: 'Lässt den Nutzer einen Account des aktuellen Clients mit einer Person verknüpfen.'
  },
  conditions: (props) => [
    hasFeature('userAssignment'),
    props.objectSchema.type === 'string',
    props.objectSchemaPointer === USERNAME_SCOPE
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props) {
    const { t } = useI18n();
    const { ability } = useVeoPermissions();

    const mayViewAccounts = computed(() => ability.value.can('view', 'accounts'));
    const {
      data: accounts,
      isFetching,
      isError
    } = useQuery(accountQueryDefinitions.queries.fetchAccounts, undefined, {
      enabled: mayViewAccounts,
      placeholderData: [],
      retry: false
    });
    const canAssignAccounts = computed(() => mayViewAccounts.value && !isError.value);

    const accountItems = computed(() => {
      const items = (accounts.value || []).map((account) => ({
        username: account.username,
        fullName: [account.firstName, account.lastName].filter(Boolean).join(' ')
      }));
      const username = props.modelValue as string | undefined;
      if (username && !items.some((item) => item.username === username)) {
        items.unshift({ username, fullName: '' });
      }
      return items;
    });

    return {
      accountItems,
      canAssignAccounts,
      isFetching,

      getControlErrorMessages,
      last,
      t
    };
  }
});
</script>

<i18n src="~/locales/base/components/dynamic-form-user-assignment.json"></i18n>
