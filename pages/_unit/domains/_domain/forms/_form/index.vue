<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Philipp Ballhausen, Jonas Heitmann, Jessica Lühnen, Annemarie Bufe
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
    :title="$t('breadcrumbs.forms')"
    fullsize
  >
    <template #default>
      <v-btn
        id="stepOne"
        outlined
        color="primary"
        class="align-self-center px-4 ma-4"
        @click="startIntro()"
      >
        Start Intro
      </v-btn>
      <VeoEntityModifier
        v-bind="$data"
        :root-route="rootRoute"
        hide-display-options
        @fetch="fetchEntities"
      >
        <template #menu-bar>
          <v-row
            dense
            class="justify-space-between col-12"
          >
            <v-col
              cols="12"
              :md="3"
              class="px-4"
            >
              <v-select
                id="hintOne"
                v-model="formType"
                :label="$t('form')"
                :items="formTypes"
                outlined
                dense
                @input="changeType"
              />
            </v-col>
            <v-col cols="auto">
              <v-btn
                outlined
                :to="`/${$route.params.unit}/domains/${$route.params.domain}/forms/${$route.params.form}/create`"
                color="primary"
                class="align-self-center"
              >
                {{ $t('create', { type: formName }) }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col

              class="flex-grow-1 search-bar"
              :class="{ 'search-bar-desktop': $vuetify.breakpoint.lgAndUp }"
            >
              <VeoListSearchBar
                id="hintTwo"
                v-model="filter"
                :object-type="formSchema && formSchema.modelType"
                @reset="filter = $event"
              />
            </v-col>
          </v-row>
        </template>
        <template #default="{ on }">
          <VeoFormList
            id="stepTwo"
            :items="objects"
            :loading="$fetchState.pending || loading"
            :show-parent-link="false"
            :load-children="loadSubEntities"
            :root-route="rootRoute"
            :object-type="formSchema && formSchema.modelType"
            v-on="on"
          />
        </template>

      </VeoEntityModifier>
    </template>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue';
import introJs from 'intro.js';
import 'intro.js/minified/introjs.min.css';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';
import { IVeoEntity, IVeoFormSchema, IVeoFormSchemaMeta, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { IVeoFilter } from '~/components/layout/VeoListSearchBar.vue';

export default Vue.extend({
  data() {
    return {
      filter: undefined as IVeoFilter | undefined,
      formSchema: undefined as IVeoFormSchema | undefined,
      objectType: '' as string | undefined,
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      formType: separateUUIDParam(this.$route.params.form).id as string,
      formTypes: [] as { value: string; text: string }[],
      rootEntityType: '' as string,
      loading: false as boolean
    };
  },
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.formId);
    this.objectType = this.formSchema && this.formSchema.modelType;
    if (this.formSchema) {
      this.rootEntityType = this.objectType || '';
      this.fetchEntities();
    } else {
      this.objects = { items: [], page: 1, pageCount: 0, totalItemCount: 0 };
    }

    this.formTypes = await this.$api.form.fetchAll(this.domainId).then((formTypes: IVeoFormSchemaMeta[]) =>
      formTypes.map((entry: IVeoFormSchemaMeta) => {
        return {
          text: entry.name[this.$i18n.locale] || 'Missing translation',
          value: entry.id
        };
      })
    );
  },
  head() {
    return {
      title: this.$t('breadcrumbs.forms') as string
    };
  },
  computed: {
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    domainId() {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    formId() {
      return separateUUIDParam(this.$route.params.form).id;
    },
    formName(): string {
      return this.formSchema?.name[this.$i18n.locale] || 'Missing translation';
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/domains/${this.$route.params.domain}/forms/${this.$route.params.form}`;
    }
  },
  watch: {
    filter(newValue: IVeoFilter) {
      this.$router.push({
        ...this.$route,
        query: {
          designator: newValue?.designator,
          name: newValue?.name,
          description: newValue?.description,
          updatedBy: newValue?.updatedBy,
          status: newValue?.status
        }
      });
      this.$fetch();
    }
  },
  mounted() {
    this.filter = {
      designator: this.$route.query.designator,
      name: this.$route.query.name,
      status: this.$route.query.status,
      description: this.$route.query.description,
      updatedBy: this.$route.query.updatedBy
    };
  },
  methods: {
    startIntro() {
      const intro = introJs();
      intro.setOptions({
        showStepNumbers: false,
        doneLabel: 'Intro beenden',
        steps: [
          {
            intro: 'Das ist ein <b>Beispiel</b> für intro.js. Lass uns die Tour starten!'
          },
          {
            element: '#stepOne',
            intro: 'Man kann einzelne kleine Elemente markieren...',
            position: 'top'
          },
          {
            element: '#stepTwo',
            intro: '...oder ganze Bereiche.'
          },
          {
            element: '#stepThree',
            intro: 'Es können übegreifende Elemente markiert werden'
          },
          {
            element: '#stepFour',
            intro: 'Hier können Hinweise für diese spezielle Seite angezeigt werden.',
            position: 'bottom'
          }
        ]
      });
      intro.start();
    },
    changeType(newType: string) {
      const newFormParam = createUUIDUrlParam('form', newType);
      this.$router.push(`/${this.$route.params.unit}/domains/${this.$route.params.domain}/forms/${newFormParam}`);
    },
    loadSubEntities(_parent: IVeoEntity) {
      return [];
    },
    async fetchEntities(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: boolean; sortDesc?: boolean }) {
      this.loading = true;

      const _options = { page: 1, reloadAll: true, sortBy: 'name', sortDesc: false, ...options };

      try {
        const data = (await this.$api.entity.fetchAll(this.objectType, _options.page, {
          unit: this.unitId,
          subType: this.formSchema?.subType,
          size: this.$user.tablePageSize,
          sortBy: _options.sortBy,
          sortOrder: _options.sortDesc ? 'desc' : 'asc',
          ...(this.filter || {})
        } as IVeoPaginationOptions)) as IVeoPaginatedResponse<IVeoEntity[]>;

        if (_options.reloadAll) {
          this.objects = data;
        } else {
          this.objects.page = data.page;
          this.objects.items.push(...data.items);
        }
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "create": "Create {type}",
    "form": "Form"
  },
  "de": {
    "create": "{type} erstellen",
    "form": "Formular"
  }
}
</i18n>

<style lang="scss" scoped>
.search-bar-desktop {
  margin: 0 24px;
}
</style>