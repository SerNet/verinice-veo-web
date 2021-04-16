<template>
  <VeoDialog v-model="dialog.value" large fixed-header fixed-footer :headline="$t('formschema')">
    <template #default>
      <div style="min-height: 20vh">
        <VeoCodeEditor :value="$props.code" readonly />
      </div>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  watch
} from '@nuxtjs/composition-api'

interface IProps {
  value: boolean
  code: string
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value })

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

    return { dialog, close }
  }
})
</script>

<i18n>
{
  "en": {
    "formschema": "Form schema"
  },
  "de": {
    "formschema": "Formschema"
  }
}
</i18n>
