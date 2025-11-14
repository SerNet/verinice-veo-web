<!--
   - verinice.veo web
   - Copyright (C) 2025 Haneen Husin
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
  <template v-if="isLoading">
    <v-col cols="12">
      <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
    </v-col>
  </template>

  <BaseCard class="flex-grow-1 d-flex mb-2" :data-test="`setting-${item.key}`">
    <v-card-text class="d-flex justify-space-between">
      <div>
        <h2 class="text-h3">{{ t(`${item.key}.header`).toString() }}</h2>
        <p v-if="t(`${item.key}.body`)">
          {{ t(`${item.key}.body`).toString() }}
        </p>
      </div>

      <div>
        <v-switch
          color="primary"
          :model-value="item.enabled"
          :aria-label="t(`${item.key}.body`)"
          @update:model-value="() => handleClick(item.key)"
        />
      </div>
    </v-card-text>
  </BaseCard>
</template>

<script setup lang="ts">
const { t } = useI18n();

export interface Props {
  item: {
    key: string;
    enabled: boolean;
  };
  handleClick: (key: string) => void;
  isLoading?: boolean;
}

defineProps<Props>();
</script>
<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
