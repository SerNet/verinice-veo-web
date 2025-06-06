<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <div style="max-width: 800px">
    <BaseAlert
      v-if="messages.valid"
      :type="VeoAlertType.SUCCESS"
      :model-value="true"
      no-close-button
      flat
      :title="t('noValidationErrors')"
      :text="messages.warnings.length || messages.information?.length ? t('warningInformationHint') : undefined"
    />
    <section v-else>
      <BaseAlert
        :type="VeoAlertType.ERROR"
        :model-value="true"
        no-close-button
        flat
        :title="t('validationErrors', [messages.errors.length])"
      >
        {{ t('validationErrorsText') }}<br />{{ t('validationErrorsAutoFixHint') }}
      </BaseAlert>
      <template
        v-for="level of levels"
        :key="
          level.key +
          level.items
            .length /* for some reason if only level.key is used, the result list won't pick up changes in the items array. */
        "
      >
        <div v-if="level.items.length" class="mt-4">
          <h3 class="text-h3">
            {{ level.title }}
          </h3>
          <BaseCard>
            <v-card-text>
              <UtilValidationResultList v-bind="attrs" :items="level.items" fixing-allowed />
            </v-card-text>
          </BaseCard>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { isArray } from 'lodash';
import { PropType } from 'vue';

import { VeoSchemaValidatorMessage, VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import { VeoAlertType } from '~/types/VeoTypes';

const props = defineProps({
  enableFixing: {
    type: Boolean,
    default: false
  },
  messages: {
    type: Object as PropType<VeoSchemaValidatorValidationResult>,
    default: () => ({
      valid: true,
      errors: [],
      information: [],
      warnings: []
    })
  }
});

const attrs = useAttrs();
const { t } = useI18n();

const levels = computed(() =>
  Object.entries(props.messages)
    .filter(([_key, value]) => isArray(value))
    .map(([key, items]) => ({
      key,
      items: items as VeoSchemaValidatorMessage[],
      title: t(`level.${key}`)
    }))
);
</script>

<i18n src="~/locales/base/components/util-validation-results.json"></i18n>
