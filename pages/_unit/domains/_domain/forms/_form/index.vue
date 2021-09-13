<template>
  <VeoPage
    :title="$t('breadcrumbs.forms')"
    fullsize
  >
    <template #default>
      <VeoEntityModifier
        v-bind="$data"
        :root-route="rootRoute"
        hide-display-options
        @fetch="fetchEntities"
      >
        <template #menu-bar>
          <v-row
            dense
            class="justify-space-between"
          >
            <v-col
              :cols="12"
              :md="3"
              class="px-4"
            >
              <v-select
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
                class="align-self-center mr-4"
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
                v-model="filter"
                :object-type="formSchema && formSchema.modelType"
                @reset="filter = $event"
              />
            </v-col>
          </v-row>
        </template>
        <template #default="{ on }">
          <VeoFormList
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
      description: this.$route.query.description,
      updatedBy: this.$route.query.updatedBy,
      status: this.$route.query.status
    };
  },
  methods: {
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
  margin: 0 100px;
}
</style>