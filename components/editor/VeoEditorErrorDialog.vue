<template>
  <VeoDialog v-model="dialog.value" :headline="$t('validation.warnings')" large>
    <template #default>
      <h3>{{ $t('validation.errors') }}:</h3>
      <v-list>
        <v-list-item v-for="(error, index) of $props.validation.errors" :key="`e_${index}`" link>
          <v-list-item-content>
            <v-list-item-title>{{ error.code }} </v-list-item-title>
            {{ error.message }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$props.validation.errors.length === 0">
          <v-list-item-content>
            <v-list-item-title>{{ $t('validation.errors.none') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <h3>{{ $t('validation.warnings') }}:</h3>
      <v-list>
        <v-list-item v-for="(warning, index) of $props.validation.warnings" :key="`w_${index}`" link>
          <v-list-item-content>
            <v-list-item-title>{{ warning.code }} </v-list-item-title>
            {{ warning.message }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
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

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator'

interface IProps {
  value: boolean
  validation: VeoSchemaValidatorValidationResult
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    validation: {
      type: Object,
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

    function close() {
      context.emit('input', false)
    }

    return { dialog, close }
  }
})
</script>

<i18n>
{
  "en": {
    "validation.errors": "Errors",
    "validation.errors.none": "No errors found!",
    "validation.warnings": "Warnings"
  },
  "de": {
    "validation.errors": "Fehler",
    "validation.errors.none": "Keine Fehler gefunden!",
    "validation.warnings": "Warnungen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
