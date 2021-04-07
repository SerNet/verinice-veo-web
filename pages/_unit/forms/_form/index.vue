<template>
  <VeoPage :title="$t('breadcrumbs.forms')" fullsize>
    <template #default>
      <v-row dense>
        <v-col :cols="12" :md="3">
          <v-select
            v-model="formType"
            :label="$t('unit.forms.form')"
            :items="formTypes"
            outlined
            dense
            @input="changeType()"
          />
        </v-col>
        <v-col :cols="9">
          <v-text-field :label="$t('unit.forms.search')" outlined dense style="visibility: hidden" />
        </v-col>
      </v-row>
      <VeoEntityModifier v-bind="$data" @fetch="$fetch" :rootRoute="rootRoute">
        <template>
          <v-btn
            outlined
            :to="`/${$route.params.unit}/forms/${$route.params.form}/create`"
            color="primary"
            class="align-self-center mr-4"
          >
            {{ $t('unit.forms.create', { type: formName }) }}
          </v-btn>
        </template>
        <template #default="{ on }">
          <VeoFormList
            v-on="on"
            :items="objects"
            :loading="$fetchState.pending"
            :show-parent-link="false"
            :load-children="loadSubEntities"
            :sorting-function="sortingFunction"
        />
        </template>
      </VeoEntityModifier>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoFormList from '~/components/objects/VeoFormList.vue'
import { separateUUIDParam } from '~/lib/utils'
import { IVeoEntity, IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes'

interface IData {
  formSchema: IVeoFormSchema | undefined
  objectType: string | undefined
  objects: IVeoEntity[]
  formType: string
  formTypes: { value: string; text: string }[]
}

export default Vue.extend({
  components: {
    VeoPage,
    VeoFormList,
  },
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: [],
      formType: separateUUIDParam(this.$route.params.form).id,
      formTypes: []
    }
  },
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.formId)
    this.objectType = this.formSchema && this.formSchema.modelType.toLowerCase()
    if (this.formSchema) {
      this.objects = await this.$api.entity.fetchAll(this.formSchema.modelType.toLowerCase(), {
        unit: this.unitId,
        subType: this.formSchema.subType
      })
    } else {
      this.objects = []
    }

    this.formTypes = await this.$api.form.fetchAll({ unit: this.unitId }).then((formTypes: IVeoFormSchemaMeta[]) =>
      formTypes.map((entry: IVeoFormSchemaMeta) => {
        return {
          text: entry.name,
          value: entry.id
        }
      })
    )
  },
  head() {
    return {
      title: this.$t('breadcrumbs.forms') as string
    }
  },
  computed: {
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id
    },
    formId() {
      return separateUUIDParam(this.$route.params.form).id
    },
    formName(): string {
      return this.formSchema?.name || ''
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/forms/${this.$route.params.form}`
    }
  },
  methods: {
    changeType() {
      this.$router.push(`/${this.$route.params.unit}/forms/${this.$route.params.form}`)
    },
    loadSubEntities(_parent: IVeoEntity) {
      return []
    },
    sortingFunction(a: IVeoEntity, b: IVeoEntity) {
      return a.name.localeCompare(b.name)
    }
  }
})
</script>

<style lang="scss" scoped></style>
