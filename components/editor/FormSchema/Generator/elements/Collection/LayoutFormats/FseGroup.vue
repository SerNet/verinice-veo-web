<template>
  <v-card outlined color="grey lighten-4" class="vf-layout vf-group  ma-2">
    <v-row no-gutters>
      <v-col>
        <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="text-right">
        <v-btn icon @click="open">
          <v-icon dense small class="pa-2">mdi-pencil</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <Draggable
          class="dragArea d-flex"
          tag="div"
          style="overflow: auto; min-width:300; min-height:100px"
          :list="formSchema.elements"
          :class="dynamicClasses"
          handle=".handle"
          :group="{ name: 'g1' }"
        >
          <slot />
        </Draggable>
      </v-col>
    </v-row>

    <VeoDialog v-model="dialog.open" headline="Edit" large persistent>
      <template #default>
        <v-autocomplete
          v-model="dialog.data.direction"
          :items="dialog.data.directionList"
          label="Direction"
        ></v-autocomplete>
        <v-combobox
          v-model="dialog.data.class"
          label="Class"
          multiple
          chips
        ></v-combobox>
        <v-combobox
          v-model="dialog.data.style"
          label="Style"
          multiple
          chips
        ></v-combobox>
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
import {
  calculateConditionsScore,
  Helpful,
  LayoutProps
} from '~/components/forms/Collection/utils/helpers'
import Draggable from 'vuedraggable'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'

export default Vue.extend({
  name: 'FseGroup',
  components: {
    Draggable
  },
  props: {
    options: Object,
    formSchema: Object,
    disabled: Boolean,
    visible: Boolean
  },
  data() {
    return {
      dialog: {
        open: false,
        data: {
          directionList: ['horizontal', 'vertical'],
          direction: 'vertical',
          class: [] as string[],
          style: [] as string[]
        }
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
    highlightClass() {
      if (this.options && this.options.highlight === false) {
        return 'no-highlight'
      } else {
        return 'highlight'
      }
    },
    dynamicClasses(): string[] {
      return [
        this.directionClass,
        this.highlightClass
        // this.options && this.options.class ? this.options.class : ''
      ]
    }
  },
  methods: {
    open() {
      this.dialog.open = true

      this.dialog.data.direction = this.getValue('#/options/direction')
      this.dialog.data.class = this.stringToArray(
        this.getValue('#/options/class'),
        ' '
      )
      this.dialog.data.style = this.stringToArray(
        this.getValue('#/options/style'),
        ';'
      )
    },
    save() {
      this.setValue('#/options/direction', this.dialog.data.direction)
      console.log(this.dialog.data.class)
      this.setValue(
        '#/options/class',
        this.arrayToString(this.dialog.data.class, ' ')
      )
      this.setValue(
        '#/options/style',
        this.arrayToString(this.dialog.data.style, ';')
      )

      this.dialog.open = false
    },
    stringToArray(string: string | undefined, separator: string): string[] {
      if (string) {
        let split = string.split(separator)
        return split.filter(el => !!el)
      } else {
        return []
      }
    },
    arrayToString(array: string[], separator: string): string {
      return array.join(separator)
    },
    getValue(pointer: string): any {
      return JsonPointer.get(this.formSchema, pointer)
    },
    setValue(pointer: string, value: any): void {
      const vjpPointer = pointer.replace('#/', '/')
      if (!!value || value === 0 || value === false) {
        vjp.set(this.formSchema, vjpPointer, value)
      } else {
        vjp.remove(this.formSchema, vjpPointer)
      }
    }
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [
        typeof props.options !== 'undefined' && props.options.format === 'group'
      ],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped></style>
