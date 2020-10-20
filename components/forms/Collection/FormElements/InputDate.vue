<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template #activator="{ on }">
        <ValidationProvider
          v-slot="{ errors }"
          :name="options && options.label"
          :rules="validation"
        >
          <v-text-field
            :value="formattedDate"
            :label="options && options.label"
            prepend-icon="mdi-calendar"
            hint="DD.MM.YYYY"
            clearable
            :error-messages="errors[0]"
            @input="setTempInputValue"
            @click:clear="clear"
            @blur="formattedDate = tempInputValue"
            v-on="on"
          />
        </ValidationProvider>
      </template>
      <v-date-picker
        v-model="date"
        no-title
        @input="menu = false"
      />
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import moment from 'moment'
import { ValidationProvider } from 'vee-validate'
import { BaseObject, IApi } from '~/components/forms/utils'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'InputDate',
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: String,
    validation: Object,
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
  },
  data: () => ({
    menu: false,
    tempInputValue: undefined as string | undefined,
    dateFormatInput: 'DD.MM.YYYY',
    dateFormatISO: 'YYYY-MM-DD'
  }),
  computed: {
    momentDate() {
      return moment(this.value, this.dateFormatISO, true)
    },
    formattedDate: {
      get(): string {
        return this.momentDate.isValid()
          ? this.momentDate.format(this.dateFormatInput)
          : this.value
      },
      set(newDate: string): void {
        this.emitDateValue(newDate, this.dateFormatInput)
      }
    },
    date: {
      get(): string {
        return this.momentDate.isValid()
          ? this.momentDate.format(this.dateFormatISO)
          : ''
      },
      set(newDate: string): void {
        this.emitDateValue(newDate, this.dateFormatISO)
      }
    }
  },
  watch: {
    formattedDate: {
      immediate: true,
      handler(newValue) {
        this.tempInputValue = newValue
      }
    }
  },
  methods: {
    clear() {
      this.$nextTick(() =>
        this.$nextTick(() => (this.tempInputValue = undefined))
      )
    },
    setTempInputValue(event: any) {
      this.tempInputValue = event
    },
    emitDateValue(date: string, dateFormat: string) {
      const tempMoment = moment(date, dateFormat, true)
      const formattedDate = tempMoment.isValid()
        ? tempMoment.format(this.dateFormatISO)
        : date
      this.$emit('input', formattedDate)
      this.$emit('change', formattedDate)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      props.schema.format === 'date'
    ])
  }
}
</script>

<style scoped></style>
