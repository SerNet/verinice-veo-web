<template>
  <VeoDialog v-model="dialog.value" :headline="headline">
    <template #default>
      <span v-text="type === 'aspect' ? $t('delete_aspect', { aspect: title }) : $t('delete_link', { link: title })" />
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">{{ $t('global.button.cancel') }}</v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('delete-item')">{{ $t('global.button.delete') }}</v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch
} from '@nuxtjs/composition-api'

interface IProps {
  value: boolean,
  title: string,
  type: 'aspect' | 'link'
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true }
  },
  setup(props, context) {
    const dialog = ref({ value: props.value })

    watch(() => props.value, (val: boolean) => {
      dialog.value.value = val
    })

    watch(() => dialog.value.value, (val: boolean) => {
      if (!val) {
        context.emit('input', val)
      }
    })

    const headline = computed(() => {
      return props.type ? context.root.$t(`headline_${props.type}`) : ''
    })

    return { dialog, headline }
  }
})
</script>

<i18n>
{
  "en": {
    "delete_aspect": "Do you really want to delete the aspect \"{aspect}\"?",
    "delete_link": "Do you really want to delete the link \"{link}\"?"
  },
  "de": {
    "delete_aspect": "Möchten Sie den Aspekt \"{aspect}\" wirklich löschen?",
    "delete_link": "Möchten Sie den Link \"{link}\" wirklich löschen?"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
