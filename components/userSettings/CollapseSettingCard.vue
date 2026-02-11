<!--
   - verinice.veo web
   - Copyright (C) 2026 Aziz Khalledi
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
  <BaseCard class="flex-grow-1 d-flex mb-2" data-test="setting-object-page-default-collapse">
    <v-card-text>
      <div class="mb-4">
        <h2 class="text-h3">{{ t('object-page-default-collapse.header') }}</h2>
        <p>{{ t('object-page-default-collapse.body') }}</p>
      </div>

      <v-radio-group v-model="localValue" :disabled="isLoading" hide-details @update:model-value="handleChange">
        <v-radio :label="t('object-page-default-collapse.options.none')" value="none" color="primary" />
        <v-radio :label="t('object-page-default-collapse.options.form')" value="form" color="primary" />
        <v-radio :label="t('object-page-default-collapse.options.info')" value="info" color="primary" />
      </v-radio-group>
    </v-card-text>
  </BaseCard>
</template>

<script setup lang="ts">
import type { ObjectPageCollapseOption } from '~/composables/api/useSettings';

const { t } = useI18n();

export interface Props {
  modelValue: ObjectPageCollapseOption;
  handleChange: (value: ObjectPageCollapseOption) => void;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value: ObjectPageCollapseOption) => props.handleChange(value)
});
</script>

<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
