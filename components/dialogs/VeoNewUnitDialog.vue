<template>
  <VeoDialog v-model="dialog" :headline="$t('unit.create')" :persistent="persistent" :close-disabled="loading">
    <template #default>
      <VeoLoadingWrapper v-if="loading" />
      <v-alert v-if="error.value" type="error">{{ error.content }}</v-alert>
      <v-form v-model="valid" class="new-unit-form">
        <v-text-field v-model="newUnit.name" :rules="rules.name" required :label="$t('unit.details.name')" />
        <v-text-field v-model="newUnit.description" :rules="rules.description" required :label="$t('unit.details.description')" />
        <!-- VEO-78: Unit Hierarchien deaktiviert, da im Backend nicht implementiert
        <v-select
          class="unit-select flex-grow-0"
          multiple
          :items="units"
          item-text="name"
          item-value="id"
          :value="newUnit.units"
          :label="$t('unit.details.children')"
        />
        -->
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn :disabled="!valid" color="primary" outlined @click="createUnit()">{{ $t('global.button.save') }}</v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import VeoLoadingWrapper from '~/components/layout/VeoLoadingWrapper.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

export default Vue.extend({
  components: {
    VeoDialog,
    VeoLoadingWrapper
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false as boolean,
      noWatch: false as boolean,
      units: [] as Array<any>,
      newUnit: {} as { units: string[]; name: string; description: string },
      valid: false as boolean,
      rules: {
        name: [(v: string) => !!v || this.$t('unit.details.name.required')],
        description: [(v: string) => !!v || this.$t('unit.details.description.required')]
      },
      error: {
        value: false as boolean,
        content: '' as string
      },
      loading: false as boolean
    }
  },
  async fetch() {
    /* if (this.$auth.profile) {
      this.units = await this.$api.unit.fetchAll()
    } */
  },
  watch: {
    value(newValue) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false
    },
    dialog(newValue) {
      if (!this.noWatch) {
        if (newValue) {
          this.dialog = newValue
        } else {
          this.$emit('input', false)
        }
      }
    }
  },
  mounted() {
    this.noWatch = true
    this.dialog = this.value
    this.noWatch = false
  },
  methods: {
    createUnit() {
      this.loading = true
      this.$api.unit
        .create(this.newUnit)
        .then(data => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, this.$t('unit.created'))
          this.error.value = false
          this.dialog = false
          this.$router.push({ path: `/${data.resourceId}` })
        })
        .catch(err => {
          this.error.value = true
          this.error.content = err
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
</script>
<style lang="scss" scoped>
.new-unit-form {
  max-width: 400px;
  width: 100%;
}
</style>
