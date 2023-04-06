<!--
   - verinice.veo web
   - Copyright (C) 2023 jae
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
    <p v-if="props.body">
      {{ props.body }}
    </p>

    <!-- No downloads available -->
    <v-alert
      v-show="props.showAlert"
      type="info"
      variant="tonal"
      :title="props.alertHeader"
      :text="props.alertBody"
    />

    <slot
      v-if="slots.prepareData"
      name="prepareData"
    />

    <template v-if="!slots.prepareData">
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
          flat
          color="primary"
          class="ms-auto mt-4"
          :loading="props.isLoading[index]"
          :disabled="props.isLoading[index]"
          @click="() => handleClick(index)"
        >
          <v-icon
            :icon="mdiDownload"
          />
          {{ props.downloadBtnCopy }}
        </v-btn>
      </template>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { useSlots } from "vue";
import { mdiDownload } from "@mdi/js";

export interface Props {
  header: string,
  body?: string,
  downloadBtnCopy: string,
  showDownloadIcon?: boolean,
  showAlert?: boolean,
  alertHeader: string,
  alertBody: string,
  items: any[],
  isLoading: boolean[],
  handleClick: (index: number) => void,
}

const props = withDefaults(defineProps<Props>(), {
  body: '',
  showDownloadIcon: true,
  showAlert: false,
  zipArchives: () => []
});

const slots = useSlots();
</script>
