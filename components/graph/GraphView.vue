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
    <v-alert v-if="isTooManyElements" type="error" variant="tonal" color="primary">
      {{ t('graph.tooManyElements') }}
    </v-alert>

    <LoadingWrapper v-else-if="isGraphReady" />
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

const route = useRoute();
const graphContainerRef = ref<HTMLDivElement | null>(null);
const isload = ref(true);
const { t } = useI18n();

const graphParameters = computed(() => ({
  elementId: String(route.params.object),
  elementType: String(route.params.objectType),
  domainId: String(route.params.domain)
}));

const { data, error } = useQuery(graphQueryDefinition.queries.fetchElementRelations, graphParameters, { retry: false });

const isTooManyElements = computed(() => {
  return error.value?.message?.includes('Too many related elements');
});

const graphData = computed(() => {
  return data.value;
});

const { destroy } = useGraph(graphContainerRef, graphData, isload);

// Ensure graph resources are released when component is unmounted
onUnmounted(() => {
  destroy();
});

const isGraphReady = computed(() => isload.value && graphContainerRef.value);
</script>
