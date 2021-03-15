<template>
  <VeoDialog v-model="dialog" :headline="$t('headline')">
    <template #default>
      {{ $t('text1', { name, parentName }) }}<br>
      {{ $t('text2') }}
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!item" @click="$emit('unlink', item.id)">
        {{ $t('headline') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<i18n>
{
  "en": {
  "text1": "Unlinking \"{name}\" only removes the object from \"{parentName}\".",
  "text2": "If you wish to delete the object, you have to delete it from the root element.",
  "headline": "Unlink object"
  },
  "de": {
    "text1": "Es wird nur die Verknüpfung von \"{name}\" zu \"{parentName}\" entfernt.",
    "text2": "Das Objekt kann nur von der obersten Ebene aus gelöscht werden.",
    "headline": "Verknüpfung entfernen"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import { IVeoEntity } from '~/types/VeoTypes'

interface IData {
  dialog: boolean
  noWatch: boolean
}

export default Vue.extend({
  components: {
    VeoDialog
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object as Prop<IVeoEntity>,
      default: undefined
    },
    parent: {
      type: Object as Prop<IVeoEntity>,
      default: undefined
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false
    } as IData
  },
  computed: {
    name(): string {
      return this.item?.name ?? ''
    },
    parentName(): string {
      return this.parent?.name ?? ''
    }
  },
  watch: {
    value(newValue: boolean) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false
    },
    dialog(newValue: boolean) {
      if (!this.noWatch) {
        this.$emit('input', newValue)
      }
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<style lang="scss" scoped></style>
