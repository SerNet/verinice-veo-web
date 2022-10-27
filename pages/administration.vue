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
  <VeoPage :title="t('breadcrumbs.administration')">
    <h2 class="text-h2 mt-6">
      {{ t('accounts') }}
    </h2>
    <p class="text-body-2">
      {{ t('accountAdministrationHint') }}
    </p>
    <VeoCard>
      <VeoObjectTable>
        <template #actions="{item}">
          <v-tooltip
            v-for="action in accountTableActions"
            :key="action.id"
            bottom
          >
            <template #activator="{on}">
              <v-btn
                icon
                @click="action.action(item)"
                v-on="on"
              >
                <v-icon v-text="action.icon" />
              </v-btn>
            </template>
            {{ t(action.label) }}
          </v-tooltip>
        </template>
      </VeoObjectTable>
    </VeoCard>
  </VeoPage>
</template>

<script lang="ts">
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const onEditAccount = () => {};

    const onDeleteAccount = () => {};

    // Table stuff
    const accountTableActions: { id: string; action: CallableFunction; icon: string; label: string }[] = [
      {
        id: 'edit',
        action: onEditAccount,
        icon: mdiPencilOutline,
        label: 'edit'
      },
      {
        id: 'delete',
        action: onDeleteAccount,
        icon: mdiTrashCanOutline,
        label: 'global.button.delete'
      }
    ];

    return {
      accountTableActions,

      t
    };
  }
});
</script>

<i18n>
{
   "en": {
    "accountAdministrationHint": "Every account has access to all units and objects in this client.",
    "accounts": "Accounts",
    "edit": "Edit"
   },
   "de": {
    "accountAdministrationHint": "Jeder Account hat Zugriff auf alle Units und Objekte in diesem Client.",
    "accounts": "Accounts",
    "edit": "Bearbeiten"
   }
}
</i18n>