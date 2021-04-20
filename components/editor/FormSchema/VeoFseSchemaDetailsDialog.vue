<template>
  <VeoDialog v-model="dialog.value" large :headline="$t('schemaDetailsHeadline')">
    <template #default>
      <v-form v-model="form.valid" class="mx-4" @submit="doSave()">
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('schemaName') }}*: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field
              :value="form.data.formSchema"
              required
              flat
              :rules="form.rules.formSchema"
              :label="$t('schemaName')"
              @input="formatSchemaName"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.subtype') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="form.data.subType" :label="$t('editor.formschema.subtype')" flat />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.type.text') }}*: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field
              :value="objectSchema"
              flat
              :label="$t('editor.formschema.create.type')"
              readonly
              disabled
              class="objectschema-type-field"
            />
          </v-col>
        </v-row>
        <small>{{ $t('global.input.requiredfields') }}</small>
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">{{ $t('global.button.cancel') }}</v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!form.valid" @click="doSave()">{{ $t('global.button.save') }}</v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  watch
} from '@nuxtjs/composition-api'
import { trim } from 'lodash'

interface IProps {
  value: boolean
  objectSchema: string
  formSchema: string
  subtype: string
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    objectSchema: {
      type: String,
      required: true
    },
    formSchema: {
      type: String,
      required: true
    },
    subtype: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value })

    const form = ref({
      data: {
        formSchema: props.formSchema as string,
        subType: props.subtype as string
      },
      rules: {
        formSchema: [(input: string) => trim(input).length > 0 || context.root.$t('global.input.required')]
      },
      valid: false
    })

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val
      }
    )

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    watch(
      () => props.formSchema,
      (val: string) => {
        form.value.data.formSchema = val
      }
    )

    watch(
      () => props.subtype,
      (val: string) => {
        form.value.data.subType = val
      }
    )

    function doSave() {
      context.emit('update-subtype', form.value.data.subType)
      context.emit('update-schema-name', form.value.data.formSchema)
      context.emit('input', false)
    }

    function formatSchemaName(val: string) {
      form.value.data.formSchema = val.toLowerCase()
    }

    return { dialog, doSave, form, formatSchemaName }
  }
})
</script>

<i18n>
{
  "en": {
    "schemaDetailsHeadline": "Formschema details",
    "schemaName": "Name of the form schema"
  },
  "de": {
    "schemaDetailsHeadline": "Formschema Eigenschaften",
    "schemaName": "Name des Formschemas"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.objectschema-type-field ::v-deep label {
  color: rgba(0, 0, 0, 0.6) !important;
}

.objectschema-type-field ::v-deep input {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
