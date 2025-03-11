<!--
verinice.veo web
Copyright (C) 2024 jae

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <LayoutLoadingWrapper v-if="isUpdatingUnit" :text="t('isUpdatingDetails')" />

  <v-row v-if="unitDetails" align="center" justify="center">
    <v-col>
      <BaseCard style="width: 100%" data-veo-test="unit-details-card">
        <v-card-title :class="`bg-accent ${hasUnitName ? '' : 'text-primary'}`">
          {{ cardTitle }}
        </v-card-title>
        <v-card-text>
          <template v-if="isLoadingCurrentUnit">
            <v-col cols="12">
              <VSkeletonLoader
                v-for="i in 2"
                :key="i"
                type="list-item-two-line"
                elevation="2"
                class="my-6"
                height="160px"
              />
            </v-col>
          </template>
          <v-form v-if="!isLoadingCurrentUnit">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="unitDetails.name"
                    :counter="10"
                    :rules="[requiredRule]"
                    :label="`${t('unitName')}*`"
                    :disabled="isDisabled"
                    hide-details
                    required
                    :aria-label="t('unitName')"
                    @keydown.enter.prevent
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="unitDetails.description"
                    :rules="[]"
                    :label="t('unitDescription')"
                    :disabled="isDisabled"
                    counter
                    :aria-label="t('unitDescription')"
                    maxlength="5000"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
      </BaseCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
export type UnitDetails = {
  name: string | undefined;
  description?: string | undefined;
};

const { t } = useI18n();

interface Props {
  isLoadingCurrentUnit?: boolean;
  isUpdatingUnit?: boolean;
  isDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoadingCurrentUnit: false,
  isUpdatingUnit: false,
  isDisabled: false
});

// Helper
const { requiredRule } = useRules();

// State
const unitDetails = defineModel<UnitDetails>();

const cardTitle = computed(() => {
  return unitDetails.value?.name ? unitDetails.value.name || t('noUnitName') : t('genericHeading');
});

const hasUnitName = computed(() => !(unitDetails.value?.name?.trim() === ''));
</script>

<i18n src="~/locales/base/components/unit-details.json"></i18n>
