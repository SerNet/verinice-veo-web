<template>
  <VeoDialog v-model="dialog" headline="Scope erstellen" :close-disabled="loading">
    <template #default>
      <VeoLoadingWrapper v-if="loading" />
      <VeoAlert
        v-model="error.value"
        :type="0"
        title="Scope konnte nicht erstellt werden"
        :text="error.text"
        no-close-button
      />
      <v-form v-model="scopeForm.valid">
        <v-text-field v-model="scopeForm.data.name" :rules="scopeForm.rules.name" required label="Name" />
        <v-combobox v-model="scopeForm.data.subScopes" :items="filteredScopes" label="Subscopes" multiple />
      </v-form>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn :disabled="!scopeForm.valid" color="primary" text @click="createScope()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, ref, Ref, useContext, watch } from '@nuxtjs/composition-api'
import { trim } from 'lodash'

import VeoAlert from '~/components/layout/VeoAlert.vue'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import VeoLoadingWrapper from '~/components/layout/VeoLoadingWrapper.vue'
import { IVeoScope } from '~/types/VeoTypes'

interface IProps {
  value: boolean
}

export default defineComponent<IProps>({
  components: {
    VeoAlert,
    VeoDialog,
    VeoLoadingWrapper
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { $api } = useContext()
    /**
     * Dialog stuff
     */
    const dialog = ref(props.value)

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value = val
        clearForm()
      }
    )

    watch(
      () => dialog.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    /**
     * Load all scopes to make them available as subscopes
     */
    const scopes: Ref<IVeoScope[]> = ref([])
    const filteredScopes: ComputedRef<IVeoScope[]> = computed(() => scopes.value)

    $api.scope.fetchAll().then(data => {
      scopes.value = data
    })

    /**
     * Form stuff
     */
    const scopeForm = ref({
      data: {
        valid: false,
        name: '',
        subScopes: []
      },
      rules: {
        name: [(input: string) => trim(input).length > 0 || 'Required']
      }
    })

    function clearForm() {
      scopeForm.value.data = {
        valid: false,
        name: '',
        subScopes: []
      }
    }

    const error = ref({
      value: false,
      text: ''
    })

    const loading = ref(false)

    function createScope() {
      loading.value = true
      $api.scope
        .create(scopeForm.value.data)
        .then(() => {
          context.emit('created')
        })
        .catch(error => {
          error.value.value = true
          error.value.text = JSON.stringify(error)
        })
        .finally(() => {
          loading.value = false
        })
    }

    return {
      dialog,
      filteredScopes,
      scopeForm,
      error,
      loading,
      createScope
    }
  }
})
</script>
<style lang="scss" scoped></style>
