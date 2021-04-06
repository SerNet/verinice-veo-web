<template>
  <VeoPage :title="$t('breadcrumbs.forms')" fullsize>
    <template #title>
      <v-spacer />
      <v-btn
        outlined
        :to="`/${unitRoute}/forms/${formRoute}/create`"
        color="primary"
        class="align-self-center mr-4"
      >
        {{ $t('unit.forms.create', { type: formName }) }}
      </v-btn>
    </template>
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
      <VeoFormList
        :items="objects"
        :loading="$fetchState.pending"
        @duplicate="doDuplicateForm"
        @delete="showDelete"
        @edit="doEdit"
      />
      <DeleteFormDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDelete" />
    </template>
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "form_cloned": "Object cloned successfully",
    "form_duplicate_error": "Failed to duplicate object"
  },
  "de": {
    "clone": "Klon",
    "form_cloned": "Objekt wurde geklont",
    "form_duplicate_error": "Objekt konnte nicht erstellt werden"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoFormList from '~/components/objects/VeoFormList.vue'
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'
import { endpoints } from '~/plugins/api/schema'
import DeleteFormDialog from '~/components/objects/VeoDeleteFormDialog.vue'
import { IVeoEntity, IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes'
import { VeoEvents } from '~/types/VeoGlobalEvents'

interface IData {
  formSchema: IVeoFormSchema | undefined
  objectType: string | undefined
  objects: IVeoEntity[]
  formType: string
  formTypes: { value: string; text: string }[]
  deleteDialog: { value: boolean; item: any }
}

export default Vue.extend({
  components: {
    VeoPage,
    VeoFormList,
    DeleteFormDialog
  },
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: [],
      formType: separateUUIDParam(this.$route.params.form).id,
      formTypes: [],
      deleteDialog: { value: false, item: undefined },
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
    unitRoute() {
      return this.$route.params.unit
    },
    formId() {
      return separateUUIDParam(this.$route.params.form).id
    },
    formRoute(): string {
      return createUUIDUrlParam('form', this.formType)
    },
    formName(): string {
      return this.formSchema?.name || ''
    },
    currentDomain(): string {
      return this.$user.currentDomain
    }
  },
  methods: {
    doEdit(item: any) {
      this.$router.push(
        `/${this.unitRoute}/forms/${this.formRoute}/${createUUIDUrlParam(this.objectType as string, item.id)}`
      )
    },
    showDelete(item: any) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDelete(id: number) {
      this.deleteDialog.value = false
      if (this.formSchema) {
        this.$api.entity.delete(this.formSchema.modelType.toLowerCase(), id).then(() => {
          this.$fetch()
        })
      }
    },
    changeType() {
      this.$router.push(`/${this.unitRoute}/forms/${this.formRoute}`)
    },
    doDuplicateForm(item: IVeoEntity) {
      if(this.formSchema) {
        const newItem = item
        item.name = `${item.name} (${this.$t('clone')})`
        this.$api.entity.create(this.formSchema.modelType.toLowerCase(), newItem).then(() => {
          this.$fetch()
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
            text: this.$t('form_cloned')
          })
        }).catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('form_duplicate_error'),
            text: JSON.stringify(error)
          })
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
