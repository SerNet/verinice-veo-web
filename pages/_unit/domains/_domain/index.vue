<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Jessica Lühnen
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
  <VeoPage
    :title="title"
    :loading="!domain"
    padding
    fullsize
  >
    <p
      v-if="domain"
      class="veo-domain-description"
    >
      <span v-if="domain.description">{{ domain.description }}</span>
      <i v-else>{{ t('unit.details.nodescription') }}</i>
    </p>
    <v-row
      no-gutters
      class="mb-4"
    >
      <v-col
        v-for="objectStatusInformation of chartData"
        :key="objectStatusInformation.objectType"
        cols="12"
      >
        <VeoStackedStatusBarChartWidget
          :title="objectStatusInformation.objectType"
          chart-height="50"
          :data="objectStatusInformation.subtypes"         
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <VeoMyLatestRevisionsWidget class="mt-8" />
      </v-col>
    </v-row>
    <VeoWelcomeDialog
      v-if="welcomeDialog"
      v-model="welcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, useContext, useMeta, useRouter, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoEntity } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IChartValue } from '~/components/widgets/VeoStackedStatusBarChartWidget.vue';

export default defineComponent({
  setup(_props, { root }) {
    const { t } = useI18n();
    const { $api, params } = useContext();
    const router = useRouter();

    const domainId = computed(() => separateUUIDParam(params.value.domain).id);
    const welcomeDialog = ref(!LocalStorage.firstStepsCompleted);

    // refetch everything if domain changes
    watch(
      () => params.value,
      () => {
        fetchDomain();
      }
    );

    // domain stuff
    const domain: Ref<IVeoDomain | undefined> = ref();

    async function fetchDomain() {
      try {
        domain.value = await $api.domain.fetch(domainId.value);
        fetchEntityStatusInformation();
      } catch (e: any) {
        if (e.code === 404) {
          root.$emit(VeoEvents.ALERT_ERROR, {
            type: ALERT_TYPE.ERROR,
            title: t('error404'),
            text: t('domainNotFoundText')
          } as IVeoEventPayload);
          router.push(`/${params.value.unit}`);
        }
      }
    }

    // As we don't have an introspection endpoint to easily fetch the amount of entities per status,
    // we have to fetch all entities, group them by subtype and then create a map with the amount of entities per status
    const types: Ref<IVeoSchemaEndpoint[]> = ref([]);
    const chartData: Ref<{ objectType: string; subtypes: { name: string; data: IChartValue[] }[] }[]> = ref([]);

    async function fetchEntityStatusInformation() {
      if (!types.value.length) {
        types.value = await $api.schema.fetchAll();
      }
      if (domain.value) {
        for (const type of types.value) {
          chartData.value.push({
            objectType: type.schemaName,
            subtypes: []
          });
        }
        for (const index in chartData.value) {
          const groupedEntities = groupEntitiesBySubType((await $api.entity.fetchAll(chartData.value[index].objectType, 1, { size: Number.MAX_VALUE })).items, domain.value.id);
          chartData.value[index].subtypes = Object.keys(groupedEntities).map((groupName) => {
            const entitiesPerStatus = getEntitiesPerStatusMap(groupedEntities[groupName]);
            // console.log(entitiesPerStatus);
            return {
              name: groupName,
              data: Object.keys(entitiesPerStatus).reduce((previousValue, currentValue) => {
                previousValue.push({
                  label: currentValue,
                  value: entitiesPerStatus[currentValue].length,
                  color: '#ee0000'
                });
                return previousValue;
              }, [] as IChartValue[])
            };
          });
        }
      }
    }

    function groupEntitiesBySubType(entities: IVeoEntity[], domain: string): { [key: string]: IVeoEntity[] } {
      return entities.reduce((previousValue, currentValue) => {
        // Push to map if key exists
        if (previousValue[currentValue.subType[domain]]) {
          previousValue[currentValue.subType[domain]].push(currentValue);
          // If domain isn't undefined, crate new map entry
        } else if (currentValue.subType[domain]) {
          previousValue[currentValue.subType[domain]] = [currentValue];
        }

        return previousValue;
      }, {} as { [key: string]: IVeoEntity[] });
    }

    function getEntitiesPerStatusMap(entities: IVeoEntity[]): { [key: string]: IVeoEntity[] } {
      return entities.reduce((previousValue, currentValue) => {
        // Push to map if key exists
        if (previousValue[currentValue.status]) {
          previousValue[currentValue.status].push(currentValue);
          // Create new map entry
        } else {
          previousValue[currentValue.status] = [currentValue];
        }
        return previousValue;
      }, {} as { [key: string]: IVeoEntity[] });
    }

    // page title
    const title = computed(() => domain.value?.name || t('domainOverview').toString());
    useMeta(() => ({
      title: title.value
    }));

    fetchDomain();

    return {
      domain,
      title,
      welcomeDialog,
      chartData,

      t
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "domainOverview": "Module overview"
  },
  "de": {
    "domainOverview": "Modulübersicht"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-domain-description {
  color: $accent;
  margin-top: -20px;
}
</style>

<i18n>
{
  "en": {
    "domainNotFoundText": "The requested domain couldn't be found. You have been returned to the unit dashboard."
  },
  "de": {
    "domainNotFoundText": "Die gewünschte Domain konnte nicht gefunden werden. Sie wurden zum Unit Dashboard zurückgebracht."
  }
}
</i18n>