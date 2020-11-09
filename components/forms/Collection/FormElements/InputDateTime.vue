<template>
  <div v-if="visible" class="vf-input-date-time">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
      @input="resetPicker"
    >
      <template #activator="{ on }">
        <ValidationProvider
          v-slot="{ errors }"
          :name="options && options.label"
          :rules="validation"
        >
          <v-text-field
            :value="formattedDateTime"
            :label="options && options.label"
            :disabled="disabled"
            prepend-icon="mdi-calendar"
            hint="DD.MM.YYYY HH:MM"
            dense
            hide-details="auto"
            clearable
            :error-messages="errors[0]"
            @input="setTempInputValue"
            @click:clear="clear"
            @blur="onBlur"
            v-on="on"
          />
        </ValidationProvider>
      </template>
      <v-tabs v-model="tab" background-color="primary" dark grow>
        <v-tabs-slider />
        <v-tab href="#tab-1">
          <v-icon>mdi-calendar</v-icon>
        </v-tab>
        <v-tab href="#tab-2" :disabled="!date">
          <v-icon>mdi-clock-outline</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <v-date-picker
            v-model="date"
            no-title
            full-width
            @input="tab = 'tab-2'"
          />
        </v-tab-item>
        <v-tab-item value="tab-2">
          <v-time-picker ref="timer" v-model="time" format="24hr" full-width />
        </v-tab-item>
      </v-tabs-items>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
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

export default (Vue as VueConstructor<Vue & { $refs: { timer: any } }>).extend({
  name: 'InputDateTime',
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
    tab: 'tab-1',
    tempInputValue: undefined as string | undefined,
    dateTimeFormatInput: 'DD.MM.YYYY HH:mm',
    dateTimeFormatISO: 'YYYY-MM-DDTHH:mm:ssZ',
    dateTimePickerFormat: 'YYYY-MM-DD HH:mm'
  }),
  computed: {
    momentDate() {
      return moment(this.value, this.dateTimeFormatISO, true)
    },
    formattedDateTime: {
      get(): string | undefined {
        return this.momentDate.isValid()
          ? this.momentDate.format(this.dateTimeFormatInput)
          : this.value
      },
      set(newDate: string): void {
        this.emitDateValue(newDate, this.dateTimeFormatInput)
      }
    },
    date: {
      get(): string {
        return this.momentDate.isValid()
          ? this.momentDate.format('YYYY-MM-DD')
          : ''
      },
      set(newDate: string): void {
        if (!this.time) {
          this.emitDateValue(`${newDate} 00:00`, this.dateTimePickerFormat)
        } else {
          this.emitDateValue(
            `${newDate} ${this.time}`,
            this.dateTimePickerFormat
          )
        }
      }
    },
    time: {
      get(): string {
        return this.momentDate.isValid() ? this.momentDate.format('HH:mm') : ''
      },
      set(newTime: string): void {
        if (this.date) {
          this.emitDateValue(
            `${this.date} ${newTime}`,
            this.dateTimePickerFormat
          )
        }
      }
    }
  },
  watch: {
    formattedDateTime: {
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
    emitDateValue(dateTime: string, dateTimeFormat: string) {
      const tempMoment = moment(dateTime, dateTimeFormat, true)
      const tempFormattedDateTime = tempMoment.isValid()
        ? tempMoment.format(this.dateTimeFormatISO)
        : dateTime
      this.$emit('input', tempFormattedDateTime)
      this.$emit('change', tempFormattedDateTime)
    },
    resetPicker() {
      this.tab = 'tab-1'
      if (this.$refs.timer) {
        this.$refs.timer.selectingHour = true
      }
    },
    onBlur() {
      this.formattedDateTime = this.tempInputValue
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      props.schema.format === 'date-time'
    ])
  }
}
</script>

<style scoped></style>
