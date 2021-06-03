<template>
  <div
    v-if="visible"
    class="vf-input-date vf-form-element"
  >
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="350px"
      min-width="350px"
    >
      <template #activator="{ on }">
        <ValidationProvider
          v-slot="{ errors }"
          :name="options && options.label"
          :rules="validation"
        >
          <v-text-field
            :value="formattedDate"
            :disabled="disabled"
            :label="options && options.label"
            prepend-icon="mdi-calendar"
            hint="DD.MM.YYYY"
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
      <v-sheet
        color="white"
        class="d-flex justify-center"
      >
        <v-date-picker
          v-model="date"
          no-title
          @input="menu = false"
        />
      </v-sheet>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';
import moment from 'moment';
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';

export default Vue.extend({
  name: 'InputDate',
  props: {
    value: String,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean
  },
  data: () => ({
    menu: false,
    tempInputValue: undefined as string | undefined,
    dateFormatInput: 'DD.MM.YYYY',
    dateFormatISO: 'YYYY-MM-DD'
  }),
  computed: {
    momentDate() {
      return moment(this.value, this.dateFormatISO, true);
    },
    formattedDate: {
      get(): string | undefined {
        return this.momentDate.isValid() ? this.momentDate.format(this.dateFormatInput) : this.value;
      },
      set(newDate: string): void {
        this.emitDateValue(newDate, this.dateFormatInput);
      }
    },
    date: {
      get(): string {
        return this.momentDate.isValid() ? this.momentDate.format(this.dateFormatISO) : '';
      },
      set(newDate: string): void {
        this.emitDateValue(newDate, this.dateFormatISO);
      }
    }
  },
  watch: {
    formattedDate: {
      immediate: true,
      handler(newValue) {
        this.tempInputValue = newValue;
      }
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => (this.tempInputValue = undefined)));
    },
    setTempInputValue(event: any) {
      this.tempInputValue = event;
    },
    emitDateValue(date: string, dateFormat: string) {
      const tempMoment = moment(date, dateFormat, true);
      const formattedDate = tempMoment.isValid() ? tempMoment.format(this.dateFormatISO) : date;
      this.$emit('input', formattedDate);
      this.$emit('change', formattedDate);
    },
    onBlur() {
      this.formattedDate = this.tempInputValue;
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'string', props.schema.format === 'date']);
  }
};
</script>
