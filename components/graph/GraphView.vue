<!--
   - verinice.veo web
   - Copyright (C) 2025 sernet
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
  <div>
    <div class="graph-toolbar">
      <v-select
        v-model="selectedLimit"
        :items="limitOptions"
        density="compact"
        variant="outlined"
        hide-details
        class="graph-limit-select"
        :aria-label="t('graph.limitSelectLabel')"
      />

      <span>
        {{ t('graph.displayed', { total: totalCount }) }}
      </span>
    </div>
    <LoadingWrapper v-if="isGraphLoading" />
    <div ref="graphContainerRef" class="graphContainerRef"></div>
  </div>
</template>

<script setup lang="ts">
import { useGraph } from '~/composables/useGraph';
import { ref } from 'vue';
import { useQuery } from '~/composables/api/utils/query';
import graphQueryDefinition from '~/composables/api/queryDefinitions/graph';
import LoadingWrapper from '../layout/LoadingWrapper.vue';
import { useI18n } from 'vue-i18n';

const DEFAULT_LIMIT = 25;
const BASE_LIMIT_OPTIONS = [10, 25, 50, 100];
const LIMIT_STEP = 50;
const LIMIT_START = 150;

const route = useRoute();
const graphContainerRef = ref<HTMLDivElement | null>(null);
const isload = ref(true);
const { t } = useI18n();
const selectedLimit = ref(DEFAULT_LIMIT);

const limitOptions = computed(() => {
  const count = totalCount.value;

  if (!count) {
    return BASE_LIMIT_OPTIONS;
  }

  const options = [...BASE_LIMIT_OPTIONS];

  if (!options.includes(count)) {
    options.push(count);
  }

  for (let value = LIMIT_START; value <= count; value += LIMIT_STEP) {
    options.push(value);
  }

  return [...new Set(options)].filter((value) => value <= count).sort((a, b) => a - b);
});

const graphParameters = computed(() => ({
  elementId: String(route.params.object),
  elementType: String(route.params.objectType),
  domainId: String(route.params.domain),
  limit: selectedLimit.value
}));

const { data } = useQuery(graphQueryDefinition.queries.fetchElementRelations, graphParameters, { retry: false });
const totalCount = computed(() => data.value?.totalCount ?? 0);

watch(
  totalCount,
  (count) => {
    if (count > 0 && count < 25) {
      selectedLimit.value = count;
    }
  },
  { immediate: true }
);

const graphData = computed(() => {
  return data.value;
});

const { destroy } = useGraph(graphContainerRef, graphData, isload);

// Ensure graph resources are released when component is unmounted
onUnmounted(() => {
  destroy();
});

const isGraphLoading = computed(() => isload.value && graphContainerRef.value);
</script>
