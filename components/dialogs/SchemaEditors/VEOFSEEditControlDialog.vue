<template>
  <VeoDialog v-model="dialog.value" :headline="$t('editor.formschema.edit.input.headline', { element: name })" large>
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.label.text') }}*:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="label" :label="$t('editor.formschema.edit.input.label')" required />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.type') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-select v-model="activeControlType.name" :disabled="alternatives.length === 1" :append-icon="alternatives.length === 1 ? '' : undefined" :items="alternatives" item-text="name" item-value="name" @input="updateActiveControlType()" />
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.direction !== undefined" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.direction') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-radio-group v-model="activeControlType.direction">
              <v-radio :label="$t('editor.formschema.edit.input.direction.horizontal')" value="horizontal" />
              <v-radio :label="$t('editor.formschema.edit.input.direction.vertical')" value="vertical" />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.highlight !== undefined" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.highlight') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-checkbox v-modl="activeControlType.highlight" :label="$t('editor.formschema.edit.input.highlight')" />
          </v-col>
        </v-row>
      </v-form>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" @click="updateElement()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref, watch } from '@nuxtjs/composition-api'
import { controlTypeAlternatives, IControlType } from '~/types/VEOEditor'
import { VeoEvents } from '~/types/VeoGlobalEvents'

interface IProps {
  value: boolean,
  name: string,
  options: any,
  schema: any,
  type: string,
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    options: {
      type: Object as PropType<any>,
      required: true
    },
    schema: {
      type: Object as PropType<any>,
      required: true
    },
    type: {
      type: String,
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
    const activeControlType: Ref<IControlType> = ref({ name: props.type, format: undefined })

    watch(() => props.type, (val: string) => {
      activeControlType.value.name = val
    })

    function updateActiveControlType() {
      const newType = alternatives.value.find(item => item.name === activeControlType.value.name)
      if (newType) {
        activeControlType.value = newType
      } else {
        context.root.$emit(VeoEvents.ALERT_ERROR, { text: 'updateActiveControlType: Control type not found' })
      }
    }

    const label: Ref<string> = ref(props.options?.label || '')
    const alternatives = computed(() => controlTypeAlternatives(activeControlType.value.name, props))

    function updateElement() {
      const options: any = activeControlType.value
      delete options.name
      context.emit('edit', { options: { label: label.value, ...options } })
    }

    return { dialog, close, activeControlType, label, alternatives, updateActiveControlType, updateElement }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
