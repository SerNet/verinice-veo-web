<template>
  <v-card elevation="0" class="fse-label mx-3 my-2 px-2">
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon small class="handle pr-1">mdi-menu</v-icon>
      </v-col>
      <v-col>
        <div class="text-caption text-truncate">
          {{ value.text }}
        </div>
      </v-col>
      <v-col cols="auto" class="text-right">
        <v-btn icon x-small @click="open">
          <v-icon dense small>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon x-small @click="deleteDialog.open = true">
          <v-icon dense small>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <VeoDialog v-model="dialog.open" headline="Edit" large persistent>
      <template #default>
        <v-text-field v-model="dialog.data.text.value" label="Text" />
        <v-combobox
          v-model="dialog.data.class.value"
          label="Class"
          multiple
          chips
          append-icon=""
        />
        <v-combobox
          v-model="dialog.data.style.value"
          label="Style"
          multiple
          chips
          append-icon=""
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

    <!-- TODO: i18n for dialogs -->
    <VeoDialog
      v-model="deleteDialog.open"
      :headline="$t('editor.formschema.delete.control.headline')"
    >
      <template #default>
        <v-card-subtitle>{{
          $t('editor.formschema.delete.control.text', { element: 'Text' })
        }}</v-card-subtitle>
      </template>
      <template #dialog-options>
        <v-spacer />
        <v-btn text color="primary" @click="deleteDialog.open = false">
          {{ $t('global.button.no') }}
        </v-btn>
        <v-btn text color="primary" @click="onDelete">
          {{ $t('global.button.delete') }}
        </v-btn>
      </template>
    </VeoDialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import { BaseObject } from '~/components/forms/utils'

export default Vue.extend({
  name: 'FseLabel',
  props: {
    name: String,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: {
      type: Object,
      default: () => undefined
    },
    formSchemaPointer: String
  },
  data() {
    return {
      dialog: {
        open: false,
        data: {
          text: { default: undefined, value: undefined },
          class: { default: undefined, value: [] as string[] },
          style: { default: undefined, value: [] as string[] }
        }
      },
      deleteDialog: {
        open: false
      }
    }
  },
  methods: {
    onDelete() {
      this.$emit('delete', this.formSchemaPointer)
    },
    open() {
      this.dialog.open = true

      this.dialog.data.text.value = this.getValue(
        '#/text',
        this.dialog.data.text.default
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
        '#/text',
        this.dialog.data.text.value,
        this.dialog.data.text.default
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
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-label {
  border: 1px solid $grey;
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
</style>
