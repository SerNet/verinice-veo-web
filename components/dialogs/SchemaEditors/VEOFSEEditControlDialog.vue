<template>
  <VeoDialog
    v-model="dialog.value"
    :key="formSchema.scope"
    :headline="$t('editor.formschema.edit.input.headline', { element: name })"
    large
  >
    <template #default>
      <v-form>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.label.text') }}*: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-text-field v-model="label" :label="$t('editor.formschema.edit.input.label')" required />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.type') }}: </span>
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
        <v-row v-if="activeControlType.name === 'Radio'" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.direction') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete v-model="activeControlType.direction" :items="directionItems"></v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.highlight !== undefined" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.highlight') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-checkbox v-model="activeControlType.highlight" :label="$t('editor.formschema.edit.input.highlight')" />
          </v-col>
        </v-row>
        <v-row v-if="activeControlType.name === 'LinksField'" no-gutters class="align-center">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.link.attributes.text') }}: </span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete
              :value="linksAttributes"
              item-text="label"
              :items="linksAttributesItems"
              multiple
              return-object
              :label="$t('editor.formschema.edit.input.link.attributes')"
              @input="onInputLinksAttributes"
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-form>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>

      <v-card v-if="activeControlType.name === 'LinksField'" flat style="border: 1px solid grey">
        <Draggable
          class="dragArea d-flex flex-column"
          tag="div"
          style="overflow: auto; width: 100%; min-height: 200px; height: 100%"
          :list="formSchemaElements"
          handle=".handle"
          :group="{ name: 'link-attributes' }"
        >
          <div v-for="(attribute, index) in formSchemaElements" :key="index" class="handle">
            <Control
              :schema="getSchema(attribute.scope)"
              :value="attribute"
              :options="attribute.options"
              :scope="attribute.scope"
            />
          </div>
        </Draggable>
      </v-card>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" outlined @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" outlined @click="updateElement()">
        {{ $t('global.button.save') }}
      </v-btn>
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
import { controlTypeAlternatives, IControlType } from '~/types/VEOEditor'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { update } from 'lodash'
import Draggable from 'vuedraggable'
import { JsonPointer } from 'json-ptr'

interface IProps {
  value: boolean
  name: string
  options: any
  schema: any
  formSchema: any
  type: string
}

export default defineComponent<IProps>({
  components: {
    Draggable,
    Control: async () => (await import('~/components/editor/FormSchema/Generator/elements/FseControl.vue')).default
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

    console.log(props)

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
    const activeControlType: Ref<IControlType> = ref({ name: props.type, format: undefined })

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

    const label: Ref<string> = ref(props.options?.label || '')
    const alternatives = computed(() => controlTypeAlternatives(activeControlType.value.name, props))

    /**
     * LinksField related code
     */

    const linksField: any = {}
    if (activeControlType.value.name === 'LinksField') {
      linksField.linksAttributesItems = ref((inject('controlsItems') as any)[props.formSchema.scope])
      linksField.formSchemaElements = ref([...props.formSchema.elements])
      linksField.linksAttributes = ref(
        linksField.formSchemaElements.value.map((obj: any) => {
          return linksField.linksAttributesItems.value.find((attr: any) => attr.scope === obj.scope)
        })
      )
      if (linksField.formSchemaElements.value.length > 0) {
        const dragElements = linksField.formSchemaElements
      }

      linksField.onInputLinksAttributes = function(event: any) {
        console.log(event)
        linksField.formSchemaElements.value = []
        event.forEach((obj: any) => {
          linksField.formSchemaElements.value.push({
            type: 'Control',
            scope: obj.scope,
            options: {
              label: obj.label
            }
          })
        })
      }

      linksField.getSchema = function(scope: string) {
        return JsonPointer.get(props.schema.items, scope)
      }
    }

    function updateElement() {
      const options: any = activeControlType.value
      let updateData: any = { options: { label: label.value, ...options } }
      if (activeControlType.value.name === 'LinksField') {
        updateData = { ...updateData, elements: linksField.formSchemaElements.value }
      }
      // delete options.name
      context.emit('edit', updateData)
    }

    return {
      dialog,
      close,
      activeControlType,
      directionItems,
      label,
      alternatives,
      updateActiveControlType,
      updateElement,
      ...linksField
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
