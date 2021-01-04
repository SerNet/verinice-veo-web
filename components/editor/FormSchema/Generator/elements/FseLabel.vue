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
    <VeoDialog
      :key="formSchemaPointer"
      v-model="dialog.open"
      :headline="$t('editor.formschema.edit.text.headline')"
      large
    >
      <template #default>
        <v-form>
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.text.text') }}*: </span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-text-field
                v-model="dialog.data.text.value"
                :label="$t('editor.formschema.edit.input.text')"
                required
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.css.class') }}: </span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-combobox
                v-model="dialog.data.class.value"
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
                v-model="dialog.data.style.value"
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
        <v-btn text color="primary" @click="dialog.open = false">
          {{ $t('global.button.close') }}
        </v-btn>
        <v-spacer />
        <v-btn text color="primary" @click="save">
          {{ $t('global.button.save') }}
        </v-btn>
      </template>
    </VeoDialog>

    <VEOFSEDeleteDialog
      v-model="deleteDialog.open"
      :name="$t('editor.formschema.elements.text.name')"
      @delete="onDelete"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import { BaseObject } from '~/components/forms/utils'
import VEOFSEDeleteDialog from '~/components/dialogs/SchemaEditors/VEOFSEDeleteDialog.vue'

export default Vue.extend({
  name: 'FseLabel',
  components: {
    VEOFSEDeleteDialog
  },
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

      this.dialog.data.text.value = this.getValue('#/text', this.dialog.data.text.default)
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
      this.setValue('#/text', this.dialog.data.text.value, this.dialog.data.text.default)
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
      return typeof elValue === 'undefined' || elValue === defaultValue ? defaultValue : elValue
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
