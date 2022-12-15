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
    <template v-for="(item, index) of items">
      <v-divider
        v-if="index > 0"
        :key="`divider_${index}`"
      />
      <v-list-item
        :key="index"
        class="d-block veo-object-message"
        :class="item.params && item.params.type ? `veo-object-message--${item.params.type}` : ''"
      >
        <v-list-item-content class="text-body-2">
          {{ item.message }}
        </v-list-item-content>
        <v-list-item-action
          v-if="item.actions && item.actions.length"
          class="fill-width ml-0 my-0"
        >
          <v-btn
            v-if="item.actions && item.actions.length === 1"
            text
            @click="item.actions && item.actions[0].callback(item, $emit)"
          >
            {{ item.actions[0].title }}
          </v-btn>
          <VeoNestedMenu
            v-else-if="item.actions && item.actions.length > 0"
            :items="formattedActions(item.actions)"
            bottom
            right
            offset-y
          >
            <template #activator="{ on }">
              <v-tooltip bottom>
                <template #activator="{ on: on2}">
                  <v-btn
                    icon
                    v-on="{ ...on2, ...on }"
                  >
                    <v-icon>
                      {{ mdiLightbulbOutline }}
                    </v-icon>
                  </v-btn>
                </template>
                <template #default>
                  {{ t('fix') }}
                </template>
              </v-tooltip>
            </template>
          </VeoNestedMenu>
        </v-list-item-action>
      </v-list-item>
    </template>
    <v-list-item
      v-if="!items.length && noErrorPlaceholderVisible"
      dense
    >
      <v-list-item-content class="font-italic text-body-2">
        <v-list-item-title>{{ t('noErrors') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiLightbulbOutline } from '@mdi/js';

import { INestedMenuEntries } from '../layout/VeoNestedMenu.vue';
import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

export default defineComponent({
  props: {
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
  },
  setup() {
    const { locale, t } = useI18n();

    const formattedActions: (actions: VeoSchemaValidatorMessage['actions']) => INestedMenuEntries[] = (actions) =>
      (actions || []).map((action) => ({
        key: action.title,
        title: action.title,
        action: action.callback
      }));

    return {
      formattedActions,
      locale,

      t,
      mdiLightbulbOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "fix": "Fix",
    "noErrors": "No errors found!"
  },
  "de": {
    "fix": "Beheben",
    "noErrors": "Keine Fehler gefunden!"
  }
}
</i18n>

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
