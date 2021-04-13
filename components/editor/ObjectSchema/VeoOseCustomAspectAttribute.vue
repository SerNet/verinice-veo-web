<template>
  <v-list-item class="veo-attribute-list-attribute my-2">
    <v-list-item-content>
      <v-row>
        <v-col :cols="8" class="py-0">
          <v-text-field
            :value="form.data.title"
            :label="`${$t('property_name')} *`"
            required
            :rules="form.rules.title"
            :prefix="prefix"
            @input="doUpdate($event, 'title')"
          />
        </v-col>
        <v-col :cols="4" class="py-0">
          <v-select
            :value="form.data.type"
            :label="$t('property_type')"
            :items="types"
            @input="doUpdate($event, 'type')"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="py-0">
          <v-text-field
            :value="form.data.description"
            :label="$t('property_description')"
            clearable
            @input="doUpdate($event, 'description')"
          />
        </v-col>
      </v-row>
      <v-row v-if="form.data.type === 'enum'" class="flex-column">
        <v-col class="py-0 d-flex align-center">
          <h3>{{ $t('values') }}</h3>
          <v-checkbox
            v-model="form.data.multiple"
            dense
            hide-details
            :label="$t('multiple')"
            class="mt-0 pt-0 ml-4"
            @change="doUpdate($event, 'multiple')"
          />
        </v-col>
        <v-col class="py-0">
          <v-combobox
            :value="form.data.enum"
            chips
            multiple
            disable-lookup
            hide-no-data
            append-icon=""
            clearable
            @input="doUpdate($event, 'enum')"
          >
            <template #label>
              <span>
                {{ $t('values_description') }}
              </span>
            </template>
            <template #selection="data">
              <v-chip
                :key="JSON.stringify(data.item)"
                v-bind="data.attrs"
                close
                @click:close="removeValueFromEnum(data.item)"
              >
                {{ data.item }}
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn fab depressed text color="black" @click="doDelete()">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, Ref } from '@nuxtjs/composition-api'
import { trim } from 'lodash'
import { INPUT_TYPES } from '~/types/VeoEditor'

interface IProps {
  title: string
  type: string
  description: string
  aspectName: string
  enum: any[]
  multiple: boolean
}

export default defineComponent<IProps>({
  props: {
    title: { type: String, default: '' },
    type: { type: String, default: 'enum' },
    description: { type: String, default: '' },
    aspectName: { type: String, required: true },
    enum: { type: Array, default: () => [] },
    multiple: { type: Boolean, default: false }
  },
  setup(props, context) {
    const prefix = computed(() => props.aspectName + '_')

    watch(
      props,
      (newValue: any) => {
        form.value.data = { ...newValue }
        nextTick().then(() => {
          form.value.data.multiple = newValue.multiple
        })
      },
      {
        deep: true
      }
    )

    const form = ref({
      data: {
        ...props
      },
      rules: {
        title: [(value: string) => trim(value).length > 0]
      }
    })

    nextTick().then(() => {
      form.value.data.multiple = props.multiple
    })

    const types = computed(() => {
      const dummy: { text: string; value: string }[] = []
      const availableTypes = INPUT_TYPES as any
      for (const entry in availableTypes) {
        if (!['null', 'unknown', 'array', 'object'].includes(availableTypes[entry].name)) {
          dummy.push({
            text: context.root.$t(`editor.inputtypes.${availableTypes[entry].name}`) as string,
            value: availableTypes[entry].name
          })
        }
      }
      return dummy
    })

    function doDelete() {
      context.emit('delete')
    }

    function doUpdate(value: any, property: string) {
      const object = { ...form.value.data } as any
      delete object.aspectName
      object[property] = value
      context.emit('update', object)
    }

    // special operations for enums
    const attributeTypes = ref([
      { text: 'Zahl', value: 'number' },
      { text: 'Ganzzahl', value: 'integer' },
      { text: 'Text', value: 'string' }
    ])

    function removeValueFromEnum(value: string) {
      doUpdate(
        props.enum.filter(entry => entry !== value),
        'enum'
      )
    }

    return {
      prefix,
      form,
      types,
      doDelete,
      doUpdate,
      attributeTypes,
      removeValueFromEnum
    }
  }
})
</script>

<i18n>
{
  "en": {
    "multiple": "Multiple",
    "property_description": "Description",
    "property_name": "attribute name",
    "property_type": "Attribute type",
    "values": "Available options",
    "values_description": "Available options (seperate entries with Enter)"
  },
  "de": {
    "multiple": "Mehrfachauswahl",
    "property_description": "Beschreobung",
    "property_name": "Name des Attributs",
    "property_type": "Typ des Attributs",
    "values": "Auswahlmöglichkeiten",
    "values_description": "Werte (mit Enter trennen)"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-attribute-list-attribute {
  border: 1px solid $grey;
  border-radius: 4px;
}
</style>
