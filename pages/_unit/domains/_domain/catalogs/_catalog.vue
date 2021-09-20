<template>
  <VeoPage
    fullsize
    :loading="$fetchState.pending"
    :title="title"
  >
    <template
      v-if="state === CATALOG_STATE.CHOOSE_TOMS"
      #default
    >
      <h2>
        {{ $t('selectTOMs') }}
      </h2>
      <v-row dense>
        <v-spacer />
        <v-col class="flex-grow-0 d-flex">
          <v-btn
            outlined
            class="mr-2"
            :disabled="selectedToms.length === 0"
            @click="selectedToms = []"
          >
            {{ $t('global.button.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="selectedToms.length === 0"
            outlined
            @click="chooseEntities"
          >
            {{ $t('global.button.next') }}
          </v-btn>
        </v-col>
      </v-row>
      <p>{{ $t('selectTOMCTA') }}</p>
      <VeoCatalogSelectionList
        v-model="selectedToms"
        :items="formattedTomItems"
        :headers="tomSelectionHeaders"
        :selectable="true"
      />
    </template>
    <template
      v-else-if="state === CATALOG_STATE.CHOOSE_ENTITIES"
      #default
    >
      <h2>
        {{ $t('applyTOMs') }}
      </h2>
      <v-row dense>
        <v-spacer />
        <v-col class="flex-grow-0 d-flex">
          <v-btn
            outlined
            class="mr-2"
            :disabled="selectedToms.length === 0"
            @click="selectedItems = []"
          >
            {{ $t('global.button.cancel') }}
          </v-btn>
          <v-btn
            outlined
            class="mr-2"
            @click="chooseToms"
          >
            {{ $t('global.button.previous') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="selectedEntities.length === 0"
            outlined
            @click="apply"
          >
            {{ $t('apply') }}
          </v-btn>
        </v-col>
      </v-row>
      <p>{{ upperFirst($t('selectedTOMs').toString()) }}</p>
      <VeoCatalogSelectionList
        :items="formattedSelectedToms"
        :headers="tomSelectionHeaders"
        :selectable="false"
      />
      <p class="mt-6">
        {{ $t('selectDPEntitiesCTA') }}
      </p>
      <VeoEntitySelectionList
        v-model="selectedEntities"
        :items="entities"
        :loading="loadingEntities"
        @page-change="fetchEntities"
        @refetch="fetchEntities"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';
import { upperFirst } from 'lodash';

import { IVeoCatalogSelectionListHeader } from '~/components/catalogs/VeoCatalogSelectionList.vue';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';

enum CATALOG_STATE {
  CHOOSE_TOMS,
  CHOOSE_ENTITIES
}

export default Vue.extend({
  data() {
    return {
      items: [] as any[],
      entities: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      selectedToms: [] as string[],
      selectedEntities: [] as { id: string; type: string }[],
      loadingEntities: false as boolean,
      applying: false as boolean,
      schemas: [] as IVeoSchemaEndpoint[],
      state: CATALOG_STATE.CHOOSE_TOMS as CATALOG_STATE,
      CATALOG_STATE
    };
  },
  async fetch() {
    this.items = await this.$api.catalog.fetchItems(this.catalogId, this.domainId);
  },
  computed: {
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    catalogId(): string {
      return separateUUIDParam(this.$route.params.catalog).id;
    },
    title(): string {
      return this.items.length > 0 && this.items[0].catalog ? this.$t('catalog', { name: this.items[0].catalog.displayName }).toString() : '';
    },
    formattedTomItems(): { designator: string; abbreviation: string; title: string; id: string }[] {
      return this.items.map((item) => {
        const displayNameParts: string[] = item.element.displayName.split(' ');

        const title = displayNameParts.pop() || '';
        const abbreviation = displayNameParts.pop() || '';
        const designator = displayNameParts.pop() || '';

        return { designator, abbreviation, title, id: item.id };
      });
    },
    formattedSelectedToms(): { designator: string; abbreviation: string; title: string; id: string }[] {
      return this.formattedTomItems.filter((item) => this.selectedToms.includes(item.id));
    },
    tomSelectionHeaders(): IVeoCatalogSelectionListHeader[] {
      return [
        {
          filterable: true,
          sortable: true,
          text: this.$t('objectlist.designator').toString(),
          value: 'item.designator',
          width: 150
        },
        {
          filterable: true,
          sortable: true,
          text: this.$t('abbreviation').toString(),
          value: 'item.abbreviation',
          width: 150
        },
        {
          filterable: true,
          sortable: true,
          text: this.$t('objectlist.title').toString(),
          value: 'item.title'
        }
      ];
    }
  },
  watch: {
    state(newValue) {
      if (newValue === CATALOG_STATE.CHOOSE_ENTITIES && this.entities.items.length === 0) {
        this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
      }
    }
  },
  methods: {
    chooseEntities() {
      this.state = CATALOG_STATE.CHOOSE_ENTITIES;
    },
    chooseToms() {
      this.state = CATALOG_STATE.CHOOSE_TOMS;
    },
    async fetchEntities(options: { page: number; sortBy: string; sortDesc: boolean }) {
      this.loadingEntities = true;

      try {
        this.entities = (await this.$api.entity.fetchAll('process', options.page, {
          subType: 'PRO_DataProcessing',
          size: this.$user.tablePageSize,
          sortBy: options.sortBy,
          sortOrder: options.sortDesc ? 'desc' : 'asc'
        } as IVeoPaginationOptions)) as IVeoPaginatedResponse<IVeoEntity[]>;
      } finally {
        this.loadingEntities = false;
      }
    },
    async apply() {
      this.applying = true;

      try {
        if (this.schemas.length === 0) {
          this.schemas = await this.$api.schema.fetchAll();
        }

        // Fetch incarnations for all selected toms
        const incarnations = await this.$api.unit.fetchIncarnations(this.selectedToms);

        // Add a reference for every selected entity to every incarnation
        for (const incarnation of incarnations.parameters) {
          for (const entity of this.selectedEntities) {
            incarnation.references = [
              {
                referencedCatalogable: {
                  targetUri: `/${getSchemaEndpoint(this.schemas, entity.type)}/${entity.id}`
                } as any,
                referenceType: 'LINK'
              }
            ];
          }
        }

        await this.$api.unit.updateIncarnations(incarnations);
      } catch (e) {
        console.log('asf123');
      } finally {
        this.applying = false;
      }
    },
    upperFirst
  }
});
</script>

<i18n>
{
  "en": {
    "abbreviation": "Abbreviation",
    "apply": "apply",
    "applyTOMs": "Apply TOMs",
    "catalog": "Catalog {name}",
    "selectTOMs": "Select TOMs",
    "selectedTOMs": "Selected TOMs",
    "selectTOMCTA": "Please choose one or more technical organizational measures to apply",
    "selectDPEntitiesCTA": "Please choose data processes to apply the technical organizational measures to."
  },
  "de": {
    "abbreviation": "Abkürzung",
    "apply": "anwenden",
    "applyTOMs": "TOMs anwenden",
    "catalog": "Katalog {name}",
    "selectTOMs": "TOMs auswählen",
    "selectedTOMs": "Ausgewählte TOMs",
    "selectTOMCTA": "Wählen Sie eine oder mehrere technische und organisatorische Maßnahmen aus, die angewendet werden sollen.",
    "selectDPEntitiesCTA": "Wählen Sie die Verarbeitungstätigkeiten aus, auf die die TOMs angewendet werden sollen."
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-card.border {
  border: 1px solid $grey;
}
</style>