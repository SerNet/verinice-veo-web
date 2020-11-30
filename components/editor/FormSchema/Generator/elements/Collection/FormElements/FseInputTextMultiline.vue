<template>
  <v-card rounded elevation="0" class="fse-input mx-3 my-2">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col cols="auto" class="text-right px-1 fse-input-dragbar">
          <v-icon class="handle">mdi-menu</v-icon>
        </v-col>
        <v-col class="px-2">
          <div style="white-space: nowrap">
            <span class="fse-input-title">{{ options && options.label }}</span>
            <span class="fse-input-type">InputTextMultiline</span>
          </div>
        </v-col>
        <v-col cols="auto" class="text-right">
          <v-btn icon x-small @click="open">
            <v-icon dense small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon x-small @click="onDelete">
            <v-icon dense small>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <VeoDialog v-model="dialog.open" headline="Edit" large persistent>
      <template #default>
        <v-autocomplete
          v-model="dialog.data.direction.value"
          :items="dialog.data.directionList"
          label="Direction"
        />
        <v-checkbox
          v-model="dialog.data.highlight.value"
          label="Highlight"
        />
        <v-combobox
          v-model="dialog.data.class.value"
          label="Class"
          multiple
          chips
        />
        <v-combobox
          v-model="dialog.data.style.value"
          label="Style"
          multiple
          chips
        />
      </template>
      <template #dialog-options>
        <v-spacer />
        <v-btn text color="primary" @click="dialog.open = false">
          {{ $t('global.button.close') }}
        </v-btn>
        <v-btn text color="primary" @click="save">
          {{ $t('global.button.save') }}
        </v-btn>
      </template>
    </VeoDialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

export default Vue.extend({
  name: 'InputText',
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: {
      type: Object,
      default: () => undefined
    },
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
  },
  data() {
    return {
      dialog: {
        open: false,
        data: {
          directionList: ['horizontal', 'vertical'],
          direction: { default: 'vertical', value: undefined },
          highlight: { default: true, value: undefined },
          class: { default: undefined, value: [] as string[] },
          style: { default: undefined, value: [] as string[] }
        }
      }
    }
  },
  methods: {
    onDelete() {
      this.$emit('delete', this.formSchemaPointer)
    },
    open() {
      this.dialog.open = true

      this.dialog.data.direction.value = this.getValue(
        '#/options/direction',
        this.dialog.data.direction.default
      )
      this.dialog.data.highlight.value = this.getValue(
        '#/options/highlight',
        this.dialog.data.highlight.default
      )
      this.dialog.data.class.value = this.stringToArray(
        this.getValue('#/options/class', this.dialog.data.class.default),
        ' '
      )
      this.dialog.data.style.value = this.stringToArray(
        this.getValue('#/options/style', this.dialog.data.style.default),
        ';'
      )
    },
    save() {
      this.setValue(
        '#/options/direction',
        this.dialog.data.direction.value,
        this.dialog.data.direction.default
      )
      this.setValue(
        '#/options/highlight',
        this.dialog.data.highlight.value,
        this.dialog.data.highlight.default
      )
      this.setValue(
        '#/options/class',
        this.arrayToString(this.dialog.data.class.value, ' '),
        this.dialog.data.class.default
      )
      this.setValue(
        '#/options/style',
        this.arrayToString(this.dialog.data.style.value, ';'),
        this.dialog.data.style.default
      )

      this.dialog.open = false
    },
    stringToArray(string: string | undefined, separator: string): string[] {
      if (string) {
        const split = string.split(separator)
        return split.filter(el => !!el)
      } else {
        return []
      }
    },
    arrayToString(array: string[], separator: string): string | undefined {
      const string = array.join(separator)
      return string || undefined
    },
    getValue(pointer: string, defaultValue: any): any {
      const elValue = JsonPointer.get(this.value, pointer)
      // Default values are not set mostly in FormSchema, therefore in this case return defaultValue, otherwise the real value
      return typeof elValue === 'undefined' || elValue === defaultValue
        ? defaultValue
        : elValue
    },
    setValue(pointer: string, value: any, defaultValue: any): void {
      const vjpPointer = pointer.replace('#/', '/')
      // Only values should be set, which are not default in FormSchema (e.g. highlight: false)
      if (value !== defaultValue) {
        vjp.set(this.value, vjpPointer, value)
      } else {
        vjp.remove(this.value, vjpPointer)
      }
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      typeof props.options !== 'undefined' &&
        props.options.format === 'multiline'
    ])
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-input {
  border: 2px solid $grey;
  min-width: 300px;
  overflow: hidden;

  .row {
    flex-wrap: nowrap;

    .col {
      align-items: center;
      display: flex;
      height: 36px;
    }
  }
}

.fse-input-title {
  color: black;
  font-size: 1.1rem;
  font-weight: bold;
  padding-right: 4px;
}

.fse-input-dragbar {
  background-color: $color-string;
  color: white;

  i {
    color: white;
  }
}
</style>
