<template>
  <VeoDialog v-model="dialog.value" :headline="$t('editor.formschema.details.headline')">
    <template #default>
      <table class="formschema--details-table">
        <tr>
          <td>{{ $t('editor.formschema.formschema') }}</td>
          <td>
            <v-text-field :value="formSchema" required flat @input="updateSchemaName" :rules="rules.formSchema" />
          </td>
        </tr>
        <tr>
          <td>{{ $t('editor.formschema.subtype') }}</td>
          <td>
            <v-text-field :value="subtype" flat @input="updateSubType" />
          </td>
        </tr>
        <tr>
          <td>{{ $t('editor.objectschema.objectschema') }}</td>
          <td>
            <v-text-field :value="objectSchema" flat readonly disabled class="objectschema-type-field" />
          </td>
        </tr>
      </table>
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
  subType: string
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

    const rules = ref({
      formSchema: [(input: string) => trim(input).length > 0 || context.root.$t('global.input.required')]
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

    function updateSubType(value: string) {
      context.emit('update-subtype', value)
    }

    function updateSchemaName(value: string) {
      if (trim(value).length > 0) {
        context.emit('update-schema-name', value)
      }
    }

    return { dialog, updateSchemaName, updateSubType, rules }
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
