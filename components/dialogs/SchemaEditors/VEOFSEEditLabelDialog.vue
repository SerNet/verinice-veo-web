<template>
  <VeoDialog
    :key="formSchemaPointer"
    :value="value"
    :headline="$t('editor.formschema.edit.text.headline')"
    large
    @input="onDialogChanged"
  >
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.text.text') }}*: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="formData.text" :label="$t('editor.formschema.edit.input.text')" required />
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
      </v-form>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>
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
import { BaseObject } from '~/components/forms/utils'
import {
  IVEOFormSchemaCustomTranslationEvent,
  IVEOFormSchemaItemUpdateEvent,
  IVEOFormSchemaTranslationCollectionItem
} from 'veo-formschema'

interface IProps {
  value: boolean
  name: string
  options: any
  formSchema: any
  formSchemaPointer: string
  customTranslation: IVEOFormSchemaTranslationCollectionItem
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
    /**
     * General variables
     */

    const defaults: BaseObject = {
      class: undefined,
      style: undefined
    }

    function getAsArray(type: 'class' | 'style'): string[] | undefined {
      if (props.formSchema?.options?.[type]) {
        const split = props.formSchema?.options?.[type].split(type === 'style' ? ';' : ' ')
        return split.filter((el: string) => !!el)
      } else {
        return []
      }
    }

    const formData = reactive({
      text: props.customTranslation?.[props.name] as string | undefined,
      class: getAsArray('class') as string[],
      style: getAsArray('style') as string[]
    })

    function getAsString(type: 'class' | 'style'): string | undefined {
      if (formData[type] && formData[type].length > 0) {
        const string = formData[type]?.join(type === 'style' ? ';' : ' ')
        return string
      } else {
        return undefined
      }
    }

    /**
     * General functions
     */

    function transformValues(values: any): any {
      const transformedValues = JSON.parse(JSON.stringify(values))
      ;['class', 'style'].forEach((propName: any) => {
        transformedValues[propName] = getAsString(propName)
      })
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

    /**
     * Common dialog stuff (opening and closing)
     */

    function onDialogChanged(event: boolean) {
      context.emit('input', event)
    }

    /**
     * LinksField related code
     */

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
      context.emit('edit', updateData as IVEOFormSchemaItemUpdateEvent['data'])
      context.emit('update-custom-translation', { [props.name]: formData.text } as IVEOFormSchemaCustomTranslationEvent)
    }

    return {
      formData,
      onDialogChanged,
      updateElement
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
