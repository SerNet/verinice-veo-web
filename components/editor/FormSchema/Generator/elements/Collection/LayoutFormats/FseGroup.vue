<template>
  <v-card v-if="level === 0" flat class="fse-group level-0" style="height: 100%; width: 100%">
    <div v-if="value.elements.length === 0" class="dropzone-placeholder">
      <div class="dropzone-placeholder-text subtitle-1">
        {{ $t('editor.formschema.dropzone.placeholder') }}
      </div>
    </div>
    <Draggable
      class="dragArea d-flex"
      tag="div"
      style="overflow: auto; width: 100%; height: 100%"
      :list="value.elements"
      :class="dynamicClasses"
      handle=".handle"
      :group="{ name: 'g1' }"
    >
      <slot />
    </Draggable>
  </v-card>
  <v-card v-else elevation="0" class="fse-group mx-3 my-2 px-2 pb-2">
    <v-row no-gutters align="center">
      <v-col cols="auto">
        <v-icon dense small class="handle pr-1">mdi-menu</v-icon>
      </v-col>
      <v-col>
        <div class="text-caption text-truncate">{{ $t('editor.formschema.elements.group.name') }}</div>
      </v-col>
      <v-col cols="auto" class="text-right">
        <v-btn icon x-small @click="open"> <v-icon dense small>mdi-pencil</v-icon></v-btn
        ><v-btn icon x-small @click="deleteDialog.open = true">
          <v-icon dense small>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <div v-if="options && options.label" class="text-subtitle-1 mb-2">
          {{ options.label }}
        </div>
        <Draggable
          class="dragArea d-flex"
          tag="div"
          style="overflow: auto; min-width:300; min-height:100px"
          :list="value.elements"
          :class="dynamicClasses"
          handle=".handle"
          :group="{ name: 'g1' }"
        >
          <slot />
        </Draggable>
      </v-col>
    </v-row>
    <VeoDialog
      :key="formSchemaPointer"
      v-model="dialog.open"
      :headline="$t('editor.formschema.edit.group.headline')"
      large
    >
      <template #default>
        <v-form>
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.label.text') }}: </span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-text-field
                v-model="dialog.data.label.value"
                :label="$t('editor.formschema.edit.input.label')"
                required
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.input.direction') }}*: </span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-autocomplete v-model="dialog.data.direction.value" :items="dialog.data.directionList" />
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
      @delete="onDelete"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import Draggable from 'vuedraggable'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import { calculateConditionsScore, Helpful, LayoutProps } from '~/components/forms/Collection/utils/helpers'
import VEOFSEDeleteDialog from '~/components/dialogs/SchemaEditors/VEOFSEDeleteDialog.vue'

export default Vue.extend({
  name: 'FseGroup',
  components: {
    Draggable,
    VEOFSEDeleteDialog
  },
  props: {
    options: Object,
    value: { type: Object, default: undefined },
    formSchemaPointer: String,
    level: Number,
    disabled: Boolean,
    visible: Boolean
  },
  data() {
    return {
      dialog: {
        open: false,
        data: {
          directionList: [
            {
              text: this.$i18n.t('editor.formschema.edit.input.direction.vertical'),
              value: 'vertical'
            },
            {
              text: this.$i18n.t('editor.formschema.edit.input.direction.horizontal'),
              value: 'horizontal'
            }
          ],
          direction: { default: 'vertical', value: undefined },
          label: { default: undefined, value: undefined },
          class: { default: undefined, value: [] as string[] },
          style: { default: undefined, value: [] as string[] }
        }
      },
      deleteDialog: {
        open: false
      }
    }
  },
  computed: {
    directionClass(): string {
      if (this.options && this.options.direction === 'horizontal') {
        return 'flex-row direction-horizontal'
      } else {
        return 'flex-column direction-vertical'
      }
    },
    dynamicClasses(): string[] {
      return [this.directionClass]
    }
  },
  methods: {
    onDelete() {
      this.$emit('delete', this.formSchemaPointer)
    },
    open() {
      this.dialog.open = true

      this.dialog.data.label.value = this.getValue('#/options/label', this.dialog.data.label.default)
      this.dialog.data.direction.value = this.getValue('#/options/direction', this.dialog.data.direction.default)
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
      this.setValue('#/options/label', this.dialog.data.label.value, this.dialog.data.label.default)
      this.setValue('#/options/direction', this.dialog.data.direction.value, this.dialog.data.direction.default)
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

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [typeof props.options !== 'undefined' && props.options.format === 'group'],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-group {
  border: 1px solid $grey;
}

.dropzone-placeholder {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.dropzone-placeholder-text {
  text-align: center;
  color: $grey;
}
</style>
