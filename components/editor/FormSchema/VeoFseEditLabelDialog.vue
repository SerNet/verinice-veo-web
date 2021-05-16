<template>
  <VeoDialog :key="formSchemaPointer" :value="value" :headline="$t('editLabelHeadline')" large @input="onDialogChanged">
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('text') }}*: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field :value="localCustomTranslation[name]" :label="$t('input')" required @input="onInputText" />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.css.class') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-combobox
              v-model="formData.class"
              :label="$t('editor.formschema.edit.css.class.text')"
              multiple
              chips
              append-icon=""
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.css.style') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-combobox
              v-model="formData.style"
              :label="$t('editor.formschema.edit.css.style.text')"
              multiple
              chips
              append-icon=""
            />
          </v-col>
        </v-row>
        <VeoFseConditions v-model="formData.rule" />
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="onDialogChanged(false)">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="updateElement">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, PropType, Ref, ref, reactive } from '@nuxtjs/composition-api'
import { JsonPointer } from 'json-ptr'

import { BaseObject } from '~/components/forms/utils'
import {
  IVeoFormSchemaCustomTranslationEvent,
  IVeoFormSchemaItemUpdateEvent,
  IVeoFormSchemaTranslationCollectionItem
} from '~/types/VeoTypes'

interface IProps {
  value: boolean
  name: string
  options: any
  formSchema: any
  formSchemaPointer: string
  customTranslation: IVeoFormSchemaTranslationCollectionItem
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
      type: Object as PropType<any>
    },
    formSchema: {
      type: Object,
      required: true
    },
    formSchemaPointer: String,
    customTranslation: {
      type: Object,
      default: () => {}
    }
  },
  setup(props, context) {
    // Default values which should not be shown in FormSchema
    const defaults: BaseObject = {
      class: undefined,
      style: undefined
    }

    const localCustomTranslation: Ref<IVeoFormSchemaTranslationCollectionItem> = ref({ ...props.customTranslation })

    // Get values of element by Pointer and if is not defined, get its default values (e.g. direction = undefined => 'vertical')
    function getValue(pointer: string, defaultValue: any): any {
      const elValue = JsonPointer.get(props.formSchema, pointer)
      // Default values are not set mostly in FormSchema, therefore in this case return defaultValue, otherwise the real value
      return typeof elValue === 'undefined' || elValue === defaultValue ? defaultValue : elValue
    }

    // Transform string values of class/style ("class-1 class-2 class-3") to an array (["class-1", "class-2", "class-3"])
    function getAsArray(type: 'class' | 'style'): string[] | undefined {
      if (props.formSchema?.options?.[type]) {
        const split = props.formSchema?.options?.[type].split(type === 'style' ? ';' : ' ')
        return split.filter((el: string) => !!el)
      } else {
        return []
      }
    }

    const formData = reactive({
      class: getAsArray('class') as string[],
      style: getAsArray('style') as string[],
      rule: getValue('#/rule', undefined)
    })

    // Transform array values of class/style backwards to string
    function getAsString(type: 'class' | 'style'): string | undefined {
      if (formData[type] && formData[type].length > 0) {
        const string = formData[type]?.join(type === 'style' ? ';' : ' ')
        return string
      } else {
        return undefined
      }
    }

    // Transform local values of options' properties to FormSchema suitable form
    function transformValues(values: any): any {
      const transformedValues = JSON.parse(JSON.stringify(values))
      ;['class', 'style'].forEach((propName: any) => {
        transformedValues[propName] = getAsString(propName)
      })

      // Remove rule property, because it does not belongs to options
      delete transformedValues.rule

      delete transformedValues.text
      Object.entries(transformedValues).forEach(([key, val]) => {
        if (defaults.hasOwnProperty(key)) {
          if (val === defaults[key]) {
            delete transformedValues[key]
          }
        }
      })
      return transformedValues
    }

    function onInputText(event: string) {
      localCustomTranslation.value[props.name] = event
    }

    // Emit Open/Close (true/false) events when dialog state changes
    function onDialogChanged(event: boolean) {
      context.emit('input', event)
    }

    // Emit translations and FormSchema updates of the element
    function updateElement() {
      let options: any = transformValues(formData)
      const formSchema = JSON.parse(JSON.stringify(props.formSchema))
      let updateData: any = { ...formSchema }
      if (Object.keys(options).length === 0) {
        if (updateData.hasOwnProperty('options')) {
          delete updateData.options
        }
      } else {
        updateData = { ...updateData, options }
      }
      // Add rule at the end of the element data if the rule exists, otherwise remove it from the element data
      if (formData.rule) {
        updateData = { ...updateData, rule: formData.rule }
      } else {
        delete updateData['rule']
      }
      const updateTranslation: IVeoFormSchemaCustomTranslationEvent = JSON.parse(
        JSON.stringify(localCustomTranslation.value)
      )
      context.emit('edit', updateData as IVeoFormSchemaItemUpdateEvent['data'])
      context.emit('update-custom-translation', updateTranslation)
    }

    return {
      formData,
      localCustomTranslation,
      onInputText,
      onDialogChanged,
      updateElement
    }
  }
})
</script>

<i18n>
{
  "en": {
    "editLabelHeadline": "Edit text element",
    "text": "Element text",
    "input": "Text"
  },
  "de": {
    "editLabelHeadline": "Text Element anpassen",
    "text": "Text des Elements",
    "input": "Text"

  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
