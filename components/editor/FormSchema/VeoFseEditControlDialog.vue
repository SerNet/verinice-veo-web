<template>
  <VeoDialog
    :key="formSchema.scope"
    v-model="dialog.value"
    :headline="$t('headline')"
    large
  >
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.label.text') }}*:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field
              :value="localCustomTranslation[name] || defaultLabel"
              :label="$t('editor.formschema.edit.input.label')"
              required
              @input="onInputLabel"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('type') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-select
              v-model="activeControlType.name"
              :disabled="alternatives.length === 1"
              :append-icon="alternatives.length === 1 ? '' : undefined"
              :items="alternatives"
              item-text="name"
              item-value="name"
              @input="updateActiveControlType()"
            />
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.highlight !== undefined" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('highlight') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-checkbox v-model="activeControlType.highlight" :label="$t('highlight')" />
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.name === 'LinksField'" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('link_attributes_description') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete
              v-model="linksAttributes"
              item-text="label"
              :items="linksAttributesItems"
              multiple
              return-object
              :label="$t('link_attributes')"
              @input="onInputLinksAttributes"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="
            activeControlType.name === 'Radio' ||
              (activeControlType.name === 'LinksField' && linksAttributes.length > 0)
          "
          no-gutters
          class="align-center"
        >
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.direction') }}:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete v-model="activeControlType.direction" :items="directionItems" />
          </v-col>
        </v-row>
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>

      <v-card
        v-if="activeControlType.name === 'LinksField' && formSchemaElements.length > 0"
        flat
        style="border: 1px solid grey"
      >
        <Draggable
          class="dragArea d-flex flex-column fill-width fill-height"
          tag="div"
          style="overflow: auto; min-height: 200px;"
          :list="formSchemaElements"
          handle=".handle"
          :group="{ name: 'link-attributes' }"
        >
          <div v-for="(attribute, index) in formSchemaElements" :key="index" class="handle">
            <VeoFseControl
              :name="attribute.scope.split('/').pop()"
              :schema="getSchema(attribute.scope)"
              :value="attribute"
              :options="attribute.options"
              :scope="attribute.scope"
              :formSchema="attribute"
              :generalTranslation="generalTranslation"
              :customTranslation="localCustomTranslation"
              @delete="onLinksAttributeDelete(index, attribute.scope)"
              @update-custom-translation="onUpdateLinksCustomTranslation"
            />
          </div>
        </Draggable>
      </v-card>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="close()">{{ $t('global.button.close') }}</v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="updateElement()">{{ $t('global.button.save') }}</v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  watch,
  getCurrentInstance,
  inject
} from '@nuxtjs/composition-api'
import Draggable from 'vuedraggable'
import { JsonPointer } from 'json-ptr'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { controlTypeAlternatives, IControlType } from '~/types/VeoEditor'
import { BaseObject } from '~/components/forms/utils'
import { IVeoFormSchemaCustomTranslationEvent, IVeoFormSchemaItem, IVeoFormSchemaTranslationCollectionItem, IVeoTranslation } from '~/types/VeoTypes'
import { differenceBy } from 'lodash'
import { deleteElementCustomTranslation } from '~/lib/FormSchemaHelper'

interface IProps {
  value: boolean
  name: string
  options: any
  schema: any
  formSchema: any
  generalTranslation: IVeoTranslation
  customTranslation: IVeoFormSchemaTranslationCollectionItem
  type: string
}

export default defineComponent<IProps>({
  components: {
    Draggable,
    Control: (): Promise<any> => import('~/components/editor/FormSchema/Generator/elements/VeoFseControl.vue')
  },
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
    formSchema: {
      type: Object,
      required: true
    },
    generalTranslation: {
      type: Object,
      default: () => {}
    },
    customTranslation: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    /**
     * General variables
     */

    const defaults: BaseObject = {
      direction: 'horizontal'
    }

    const localCustomTranslation: Ref<IVeoFormSchemaTranslationCollectionItem> = ref({ ...props.customTranslation })

    /**
     * General functions
     */
    function getValue(pointer: string, defaultValue: any): any {
      const elValue = JsonPointer.get(props.formSchema, pointer)
      // Default values are not set mostly in FormSchema, therefore in this case return defaultValue, otherwise the real value
      return typeof elValue === 'undefined' || elValue === defaultValue ? defaultValue : elValue
    }

    function transformValues(values: any): any {
      const transformedValues = JSON.parse(JSON.stringify(values))
      // name is only used for activeControlType but not in option, therefore it should be deleted before saving
      delete transformedValues.name
      Object.entries(values).forEach(([key, val]) => {
        if (defaults.hasOwnProperty(key)) {
          transformedValues[key] = val === defaults[key] ? undefined : val
        }
      })
      return transformedValues
    }

    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value })

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val
      }
    )

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    function close() {
      context.emit('input', false)
    }

    /**
     * Control types related stuff
     */
    const activeControlType: Ref<IControlType> = ref({
      name: props.type,
      format: props.options.format,
      ...((props.type === 'Radio' || props.type === 'LinksField') && {
        direction: getValue('#/options/direction', defaults.direction)
      })
    })

    watch(
      () => props.type,
      (val: string) => {
        activeControlType.value.name = val
      }
    )

    // Get current instance for using translations in Setup() https://github.com/kazupon/vue-i18n/issues/693#issuecomment-583796174
    const vm = getCurrentInstance()

    const directionItems = ref([
      {
        text: vm?.$i18n.t('editor.formschema.edit.input.direction.vertical'),
        value: 'vertical'
      },
      {
        text: vm?.$i18n.t('editor.formschema.edit.input.direction.horizontal'),
        value: 'horizontal'
      }
    ])

    watch(
      () => props.type,
      (val: string) => {
        activeControlType.value.name = val
      }
    )

    function updateActiveControlType() {
      const newType = alternatives.value.find(item => item.name === activeControlType.value.name)
      if (newType) {
        activeControlType.value = newType
      } else {
        context.root.$emit(VeoEvents.ALERT_ERROR, {
          text: 'updateActiveControlType: Control type not found'
        })
      }
    }

    /**
     * Label related code
     */

    function getDefaultLabel() {
      return props.generalTranslation?.[props.name] || props.name
    }
    const defaultLabel: Ref<string> = ref(getDefaultLabel())

    function onInputLabel(event: string) {
      localCustomTranslation.value[props.name] = event
    }

    const alternatives = computed(() => controlTypeAlternatives(activeControlType.value.name, props))

    /**
     * LinksField related code
     */

    const linksField: any = {}
    if (activeControlType.value.name === 'LinksField') {
      linksField.linksAttributesItems = ref((inject('controlsItems') as any).value[props.formSchema.scope])
      // Important: JSON.parse(JSON.stringify()) is necessary to avoid edition of array objects through reference before saving
      linksField.formSchemaElements = ref(JSON.parse(JSON.stringify(props.formSchema.elements)))
      linksField.linksAttributes = ref(
        linksField.formSchemaElements.value.map((obj: any) => {
          return linksField.linksAttributesItems.value.find((attr: any) => attr.scope === obj.scope)
        })
      )

      if (linksField.formSchemaElements.value.length > 0) {
        const dragElements = linksField.formSchemaElements
      }

      watch(
        () => linksField.linksAttributes.value,
        (newVal, oldVal) => {
          if (newVal.length === 0) {
            activeControlType.value.direction = undefined
          } else {
            activeControlType.value.direction = activeControlType.value.direction
              ? activeControlType.value.direction
              : defaults.direction
          }
        }
      )

      linksField.onInputLinksAttributes = function(event: any) {
        // Get attributes which were deleted in the autocomplete element
        const deletedLinksAttributes: IVeoFormSchemaItem[] = differenceBy<any>(
          linksField.formSchemaElements.value,
          event,
          'scope'
        )
        linksField.formSchemaElements.value = []
        event.forEach((obj: any) => {
          linksField.formSchemaElements.value.push({
            type: 'Control',
            scope: obj.scope,
            options: {
              label: `#lang/${obj.propertyName}`
            }
          })
        })

        deletedLinksAttributes.forEach(deletedElementFormSchema => {
          deleteElementCustomTranslation(
            deletedElementFormSchema,
            localCustomTranslation.value,
            updatedCustomTranslationValue => {
              linksField.onUpdateLinksCustomTranslation(updatedCustomTranslationValue)
            }
          )
        })
      }

      linksField.onLinksAttributeDelete = function(index: any, scope: string) {
        deleteElementCustomTranslation(
          linksField.formSchemaElements.value[index],
          localCustomTranslation.value,
          updatedCustomTranslationValue => {
            linksField.onUpdateLinksCustomTranslation(updatedCustomTranslationValue)
          }
        )
        linksField.linksAttributes.value.splice(
          linksField.linksAttributes.value.findIndex((attr: any) => attr.scope === scope),
          1
        )
        linksField.formSchemaElements.value.splice(index, 1)
      }

      linksField.onUpdateLinksCustomTranslation = function(event: IVeoFormSchemaTranslationCollectionItem) {
        localCustomTranslation.value = event
      }

      linksField.getSchema = function(scope: string) {
        return JsonPointer.get(props.schema.items, scope)
      }
    }

    function updateElement() {
      const options: any = transformValues(activeControlType.value)
      let updateData: any = { ...props.formSchema, options: { label: props.formSchema?.options?.label, ...options } }
      if (activeControlType.value.name === 'LinksField') {
        updateData = { ...updateData, elements: linksField.formSchemaElements.value }
      }
      const updateTranslation: IVeoFormSchemaCustomTranslationEvent = JSON.parse(
        JSON.stringify(localCustomTranslation.value)
      )
      context.emit('edit', JSON.parse(JSON.stringify(updateData)))
      context.emit('update-custom-translation', updateTranslation)
    }

    return {
      dialog,
      localCustomTranslation,
      close,
      activeControlType,
      directionItems,
      defaultLabel,
      onInputLabel,
      alternatives,
      updateActiveControlType,
      updateElement,
      ...linksField
    }
  }
})
</script>

<i18n>
{
  "en": {
    "headline": "Edit input element",
    "highlight": "Highlight element",
    "link_attributes": "Attributes",
    "link_attributes_description": "Link attributes",
    "type": "Control type"
  },
  "de": {
    "headline": "Input Element anpassen",
    "highlight": "Element hervorheben",
    "link_attributes": "Attribute",
    "link_attributes_description": "Linkattribute",
    "type": "Steuerelement Typ"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
