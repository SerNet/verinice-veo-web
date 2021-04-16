<template>
  <VeoDialog v-model="dialog.value" :headline="$t('deleteControlHeadline')">
    <template #default>
      {{ $t('deleteControlConfirmation') }}
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('delete')">
        {{ $t('global.button.delete') }}
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
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
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

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    return { dialog }
  }
})
</script>

<i18n>
{
  "en": {
    "deleteControlHeadline": "Delete element",
    "deleteControlConfirmation": "Do you really want to remove the element from the form schema?"
  },
  "de": {
    "deleteControlHeadline": "Element löschen",
    "deleteControlConfirmation": "Möchten Sie das Element wirklich aus dem Formschema entfernen?"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
