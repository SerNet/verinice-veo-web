<!--
   - verinice.veo web
   - Copyright (C) 2023 SerNet
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
  <BaseCard
    padding
    flex-column
  >
    <h2 class="text-h3">
      {{ props.header }}
    </h2>
    <p>
      {{ props.body }}
    </p>

    <!-- No downloads available -->
    <v-alert
      v-show="items?.length == 0 && !prepareData && !isLoading"
      type="info"
      variant="tonal"
      :title="props.alertHeader"
      :text="props.alertBody"
    />

    <!-- Downloads -->
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <v-divider class="mt-4" />
      <h3
        v-if="item.name"
        class="text-h4 mt-2"
      >
        {{ item.name }}
      </h3>
      <v-btn
        v-show="!prepareData"
        color="primary"
        flat
        class="ms-auto mt-4"
        :loading="item.isLoading"
        :disabled="item.isLoading"
        @click="() => handleClick(index)"
      >
        <v-icon
          :icon="mdiDownload"
        />
        {{ props.downloadBtnCopy }}
      </v-btn>
    </template>

    <!-- Prepare Downloads -->
    <v-btn
      v-show="prepareData"
      :loading="isLoading"
      color="primary"
      variant="outlined"
      class="ms-auto mt-4"
      @click="prepareDownload"
    >
      {{ props.prepareBtnCopy }}
    </v-btn>
  </BaseCard>
</template>

<script setup lang="ts">
import { mdiDownload } from "@mdi/js";

export interface Props {
  header: string,
  body: string,
  downloadBtnCopy: string,
  prepareBtnCopy: string,
  showDownloadIcon?: boolean,
  alertHeader: string,
  alertBody: string,
  items: any[],
  zipArchives?: Blob[],
  prepareData?: boolean,
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDownloadIcon: true,
  zipArchives: () => [],
  prepareData: false,
  isLoading: false
});

const emit = defineEmits<{
  (e: 'export-data', index: number): void;
  (e: 'prepare-download'): void
}>();

function handleClick(index: number) {
  emit('export-data', index);
}

function prepareDownload() {
  emit('prepare-download');
}
</script>
