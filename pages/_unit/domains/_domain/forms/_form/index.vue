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
            <v-col
              cols="auto"
              class="d-none"
            >
              <v-text-field
                :label="$t('search')"
                outlined
                dense
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
        </template>
        <template #default="{ on }">
          <VeoFormList
            :items="objects"
            :loading="$fetchState.pending || loading"
            :show-parent-link="false"
            :load-children="loadSubEntities"
            :root-route="rootRoute"
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

interface IData {
  formSchema: IVeoFormSchema | undefined;
  objectType: string | undefined;
  objects: IVeoPaginatedResponse<IVeoEntity[]>;
  formType: string;
  formTypes: { value: string; text: string }[];
  rootEntityType: string;
  loading: boolean;
}

export default Vue.extend({
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 },
      formType: separateUUIDParam(this.$route.params.form).id,
      formTypes: [],
      rootEntityType: '',
      loading: false
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

      const data = (await this.$api.entity.fetchAll(this.objectType, _options.page, {
        unit: this.unitId,
        subType: this.formSchema?.subType,
        size: this.$user.tablePageSize,
        sortBy: _options.sortBy,
        sortOrder: _options.sortDesc ? 'desc' : 'asc'
      } as IVeoPaginationOptions)) as IVeoPaginatedResponse<IVeoEntity[]>;

      if (_options.reloadAll) {
        this.objects = data;
      } else {
        this.objects.page = data.page;
        this.objects.items.push(...data.items);
      }
      this.loading = false;
    }
  }
});
</script>

<i18n>
{
  "en": {
    "create": "Create {type}",
    "form": "Form",
    "search": "Search"
  },
  "de": {
    "create": "{type} erstellen",
    "form": "Formular",
    "search": "Suche"
  }
}
</i18n>
