<template>
  <VeoDialog v-model="dialog.value" :headline="$t('editor.formschema.details.headline')">
    <template #default>
      <v-form v-model="form.valid">
        <table class="formschema--details-table">
          <tr>
            <td>{{ $t('editor.formschema.title.text') }}*:</td>
            <td>
              <v-text-field
                :value="form.data.formSchema"
                required
                flat
                :rules="form.rules.formSchema"
                @input="formatSchemaName"
              />
            </td>
          </tr>
          <tr>
            <td>{{ $t('editor.formschema.subtype') }}:</td>
            <td>
              <v-text-field v-model="form.data.subType" flat />
            </td>
          </tr>
          <tr>
            <td>{{ $t('editor.formschema.create.type.text') }}*:</td>
            <td>
              <v-text-field :value="objectSchema" flat readonly disabled class="objectschema-type-field" />
            </td>
          </tr>
        </table>

        <small>{{ $t('editor.dialog.requiredfields') }}</small>
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
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
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

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.formschema--details-table {
  tr {
    vertical-align: baseline;

    td:first-of-type {
      padding-right: 16px;
    }
  }
}

.objectschema-type-field ::v-deep label {
  color: rgba(0, 0, 0, 0.6) !important;
}

.objectschema-type-field ::v-deep input {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
