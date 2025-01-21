<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <v-list>
    <template v-for="(item, index) of items" :key="index">
      <v-divider v-if="index > 0" />
      <v-list-item
        class="d-block veo-object-message"
        :class="item.params && item.params.type ? `veo-object-message--${item.params.type}` : ''"
      >
        <v-list-item-title class="text-body-2" style="white-space: normal">
          {{ item.message }}
        </v-list-item-title>
        <v-list-item-action v-if="item.actions && item.actions.length" class="fill-width ml-0 my-0">
          <v-btn
            v-if="item.actions && item.actions.length === 1"
            variant="text"
            @click="item.actions && item.actions[0].callback(item, $emit)"
          >
            <v-icon :icon="mdiLightbulbOutline" start />
            {{ isFunction(item.actions[0].title) ? item.actions[0].title(t) : item.actions[0].title }}
          </v-btn>
          <UtilNestedMenu
            v-else-if="item.actions && item.actions.length > 0"
            :items="formattedActions(item.actions)"
            bottom
            right
            offset-y
          >
            <template #activator="{ props: menu }">
              <v-tooltip location="left">
                <template #activator="{ props: tooltip }">
                  <v-btn :icon="mdiLightbulbOutline" variant="text" v-bind="mergeProps(menu, tooltip)" />
                </template>
                <template #default>
                  {{ t('fix') }}
                </template>
              </v-tooltip>
            </template>
          </UtilNestedMenu>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import { mergeProps, PropType } from 'vue';
import { mdiLightbulbOutline } from '@mdi/js';

import { INestedMenuEntries } from './NestedMenu.vue';
import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';
import { isFunction } from 'lodash';

defineProps({
  items: {
    type: Array as PropType<VeoSchemaValidatorMessage[]>,
    default: () => []
  },
  noErrorPlaceholderVisible: {
    type: Boolean,
    default: false
  },
  fixingAllowed: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

const formattedActions: (actions: VeoSchemaValidatorMessage['actions']) => INestedMenuEntries[] = (actions) =>
  (actions || []).map((action) => ({
    key: action.key,
    title: action.title,
    action: action.callback
  }));
</script>

<i18n src="~/locales/base/components/util-ValidationResultList.json"></i18n>

<style lang="scss" scoped>
.v-list {
  background-color: transparent;
}

.veo-object-message {
  border-left: 4px solid transparent;
}

.veo-object-message--success {
  border-left: 4px solid #4caf50;
}

.veo-object-message--info {
  border-left: 4px solid #2196f3;
}

.veo-object-message--warning {
  border-left: 4px solid #fb8c00;
}

.veo-object-message--error {
  border-left: 4px solid $primary;
}
</style>
