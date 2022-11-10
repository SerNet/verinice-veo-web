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
        <v-list-item-action class="fill-width ml-0 my-0">
          <v-btn
            v-if="item.fixable && fixingAllowed"
            text
            @click="$emit('fix', item.code, item.params)"
          >
            {{ t('fix') }}
          </v-btn>
          <v-btn
            v-if="item.actions && item.actions.length === 1"
            text
            @click="item.actions && item.actions[0].callback()"
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
          <VeoPopoverMenu
            v-if="item.decisionRules && Object.keys(item.decisionRules).length > 0"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  {{ mdiInformationOutline }}
                </v-icon>
              </v-btn>
            </template>
            <div
              v-for="(rules, outputGroupIndex) of item.decisionRules"
              :key="outputGroupIndex"
              class="pt-4 px-2"
            >
              <span class="text-body-1">{{ t('rulesWithResult', [t(`output.${rules[0].output}`).toString()]) }}</span>
              <ul>
                <li
                  v-for="rule in rules"
                  :key="rule.index"
                  :class="{
                    'font-weight-bold': rule.index=== item.decisiveRule,
                    'veo-disabled': !item.matchingRules || !item.matchingRules.includes(rule.index || 0)
                  }"
                  class="my-2"
                >
                  {{ rule.description[locale] || Object.values(rule.description)[0] }}
                </li>
              </ul>
            </div>
            <v-divider class="mb-1" />
            <i18n
              tag="p"
              path="rules.ruleBold"
              class="text-body-2 mx-3 mb-0"
            >
              <b>{{ t('rules.bold') }}</b>
            </i18n>
            <i18n
              tag="p"
              path="rules.ruleGrey"
              class="text-body-2 mx-3 mb-0"
            >
              <span class="veo-disabled">{{ t('rules.grey') }}</span>
            </i18n>
            <p class="text-body-2 mx-3 mb-0 pb-2">
              {{ t('rules.ruleDefault') }}
            </p>
          </VeoPopoverMenu>
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
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiInformationOutline, mdiLightbulbOutline, mdiHelpCircleOutline } from '@mdi/js';

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
      mdiLightbulbOutline,
      mdiInformationOutline,
      mdiCheckCircleOutline,
      mdiCloseCircleOutline,
      mdiHelpCircleOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "fix": "Fix",
    "noErrors": "No errors found!",
    "output": {
      "false": "no",
      "true": "yes",
      "undefined": "unknown"
    },
    "rules": {
      "bold": "Bold",
      "grey": "Greyed out",
      "ruleBold": "{0} rules are responsible for the decision.",
      "ruleDefault": "Not greyed out rules apply.",
      "ruleGrey": "{0} rules don't apply."
    },
    "rulesWithResult": "Rules with the result {0}:"
  },
  "de": {
    "fix": "Beheben",
    "noErrors": "Keine Fehler gefunden!",
    "output": {
      "false": "nein",
      "true": "ja",
      "undefined": "unbestimmt"
    },
    "rules": {
      "bold": "Fettgedruckte",
      "grey": "Ausgegraute",
      "ruleBold": "{0} Regeln sind verantwortlich für die Entscheidung",
      "ruleDefault": "Nicht ausgegraute Regeln treffen zu.",
      "ruleGrey": "{0} Regeln treffen nicht zu."
    },
    "rulesWithResult": "Regeln mit dem Ergebnis {0}:"
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
