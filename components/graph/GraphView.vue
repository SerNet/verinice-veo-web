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
  <template v-if="isGraphReady">
    <v-col cols="12">
      <LoadingWrapper />
    </v-col>
  </template>
  <div ref="graphContainerRef" class="graphContainerRef"></div>
</template>

<script setup lang="ts">
import { useGraph } from '~/composables/useGraph';
import { ref } from 'vue';
import { useQuery } from '~/composables/api/utils/query';
import graphQueryDefinition from '~/composables/api/queryDefinitions/graph';
import LoadingWrapper from '../layout/LoadingWrapper.vue';

const route = useRoute();
const graphContainerRef = ref<HTMLDivElement | null>(null);
const isload = ref(true);

const graphParameters = computed(() => ({
  elementId: String(route.params.object),
  elementType: String(route.params.objectType),
  domainId: String(route.params.domain)
}));

const { data } = useQuery(graphQueryDefinition.queries.fetchElementRelations, graphParameters);

const graphData = computed(() => data.value);
const { destroy } = useGraph(graphContainerRef, graphData, isload);

onUnmounted(() => {
  destroy();
});

const isGraphReady = computed(() => isload.value && graphContainerRef);

useGraph(graphContainerRef, graphData, isload);
</script>
