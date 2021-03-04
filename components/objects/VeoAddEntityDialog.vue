<template>
  <VeoDialog v-model="dialog" :headline="$t('headline')">
    <template #default>
      {{ $t('add_subentities', { name: entityName }) }}
      <v-autocomplete
        v-model="selectedEntities"
        :items="displayedEntities"
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
        @click="$emit('add-entities', selectedEntities)"
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
import { IVeoEntity } from '~/types/VeoTypes'

interface IData {
  dialog: boolean
  noWatch: boolean
  selectedEntities: string[]
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
    entities: {
      type: Array as Prop<IVeoEntity[]>,
      default: []
    },
    currentEntity: {
      type: Object as Prop<IVeoEntity | undefined>,
      default: undefined
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false,
      selectedEntities: []
    } as IData
  },
  computed: {
    entityName(): string {
      return this.currentEntity?.name || ''
    },
    displayedEntities(): IVeoEntity[] {
      return this.entities.filter(entity => entity.id !== this.currentEntity?.id)
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

      if (newValue) {
        this.selectedEntities = this.currentEntity?.parts.map(child => child.targetUri.split('/').pop() || '') || []
      }
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<style lang="scss" scoped></style>
