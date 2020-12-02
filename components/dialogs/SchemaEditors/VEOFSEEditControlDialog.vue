<template>
  <VeoDialog v-model="dialog.value" :headline="$t('editor.formschema.edit.input.headline', { element: name })" large persistent>
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.label.text') }}*:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="scope" :label="$t('editor.formschema.edit.input.label')" required />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.scope.text') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="options.label" :label="$t('editor.formschema.edit.input.scope')" required />
          </v-col>
        </v-row>
      </v-form>
      <p class="pb-0 pt-2" style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.type') }}:</p>
      <v-tabs v-model="activeControl" center-active>
        <v-tab v-for="control in $props.availableControls" :key="control.name">
          {{ control.name }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeControl">
        <v-tab-item v-for="control in $props.availableControls" :key="control.name">
          {{ control }}
        </v-tab-item>
      </v-tabs-items>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" @click="saveNode()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, PropType, Ref, ref, watch } from '@nuxtjs/composition-api'
import { IVEOFormSchemaItemOptions } from 'veo-objectschema-7'
import { IInputElement } from '~/types/VEOEditor'

interface IProps {
  value: boolean,
  availableControls: IInputElement[],
  name: string,
  schema: any
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    availableControls: {
      type: Array as PropType<IInputElement[]>,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    schema: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value })

    watch(() => props.value, (val: boolean) => {
      dialog.value.value = val
    })

    watch(() => dialog.value.value, (val: boolean) => {
      if (!val) {
        context.emit('input', val)
      }
    })

    function close() {
      context.emit('input', false)
    }

    /**
     * Control types related stuff
     */
    const activeControl: Ref<string> = ref('')

    const scope: Ref<string> = ref('')
    const options: Ref<IVEOFormSchemaItemOptions> = ref({
      label: '' as string
    })

    return { dialog, close, activeControl, scope, options }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
