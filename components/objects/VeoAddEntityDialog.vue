<template>
  <VeoDialog v-model="dialog" :headline="$t('headline')">
    <template #default>
      {{ $t('add_subentities', { name: entityName }) }}
      <v-autocomplete
        v-model="selectedItems"
        :items="displayedItems"
        item-value="id"
        item-text="name"
        clearable
        multiple
      />
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="add()"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<i18n>
{
  "en": {
    "add_subentities": "Add sub objects to \"{name}\"",
    "headline": "Edit sub objects"
  },
  "de": {
    "add_subentities": "Unterobjekte zu \"{name}\" hinzufügen",
    "headline": "Unterobjekte bearbeiten"
  }
}
</i18n>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import { IVeoEntity, IVeoScope } from '~/types/VeoTypes'

export interface IItem {
  id: string
  type: string
  name: string
  hidden: boolean
  selected: boolean
}

interface IData {
  dialog: boolean
  noWatch: boolean
  selectedItems: string[]
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
    items: {
      type: Array as Prop<IItem[]>,
      default: () => []
    },
    editedItem: {
      type: Object as Prop<IVeoEntity | IVeoScope | undefined>,
      default: undefined
    },
    eventName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false,
      selectedItems: []
    } as IData
  },
  computed: {
    entityName(): string {
      return this.editedItem?.name || ''
    },
    displayedItems(): IItem[] {
      return this.items.filter(item => item.id !== this.editedItem?.id && !item.hidden)
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

      if (newValue && this.editedItem) {
        this.selectedItems = this.items.filter(item => item.selected && !item.hidden).map(item => item.id)
      }
    }
  },
  methods: {
    add() {
      const dummy: IItem[] = []
      dummy.push(...this.items.filter(item => item.hidden && item.selected)) // Add hidden, yet selected items
      dummy.push(...this.items.filter(item => this.selectedItems.includes(item.id)))

      this.$emit(this.eventName, dummy)
    },
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<style lang="scss" scoped></style>
