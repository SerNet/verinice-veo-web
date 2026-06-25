<!--
   - verinice.veo web
   - Copyright (C) 2026  djm
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
-->
<template>
  <div
    v-if="options.visible"
    :id="objectSchemaPointer"
    class="vf-form-element vf-input-duration"
    :class="options.class"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
    role="group"
    :aria-label="options.label"
  >
    <div v-if="options.label" class="vf-input-duration__label text-medium-emphasis">
      {{ options.label }}
    </div>

    <div class="vf-input-duration__container">
      <div class="vf-input-duration__inputs">
        <div v-for="part in durationParts" :key="part" class="vf-input-duration__field">
          <div class="vf-input-duration__field-label text-medium-emphasis">
            {{ t(part) }}
          </div>

          <v-number-input
            :model-value="localValue[part]"
            :disabled="disabled || options.disabled"
            :aria-label="t(part)"
            class="vf-input-duration__input"
            control-variant="stacked"
            variant="underlined"
            density="compact"
            placeholder="-"
            persistent-placeholder
            :min="0"
            :step="1"
            hide-details
            inset
            @update:model-value="updateDraftPart(part, $event)"
            @update:focused="handleFocusedUpdate($event)"
            @keydown.enter="commitDuration"
            @wheel.prevent.stop
          />
        </div>

        <v-btn
          :icon="mdiCloseCircle"
          variant="text"
          density="compact"
          :disabled="disabled || options.disabled || !hasValue"
          :aria-label="t('clear')"
          class="vf-input-duration__clear"
          @click="clear"
        />
      </div>
    </div>

    <div v-for="error in getControlErrorMessages($props)" :key="error" class="vf-input-duration__error text-error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { mdiCloseCircle } from '@mdi/js';
import { last } from 'lodash';

import type { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import {
  EMPTY_DURATION,
  formatDraftDuration,
  formatDuration,
  normalizeDurationPart,
  normalizeDurationParts,
  parseDuration,
  type DurationPart,
  type DurationParts
} from '../duration/duration';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-duration-input',
  name: {
    en: 'duration input',
    de: 'Dauereingabe'
  },
  description: {
    en: 'Lets the user enter a duration in weeks, days, hours, minutes and seconds.',
    de: 'Ermöglicht die Eingabe einer Dauer in Wochen, Tagen, Stunden, Minuten und Sekunden.'
  },
  conditions: (props) => [props.objectSchema.type === 'string', props.objectSchema.format === 'duration']
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const durationParts: DurationPart[] = ['weeks', 'days', 'hours', 'minutes', 'seconds'];
    const localValue = ref<DurationParts>({ ...EMPTY_DURATION });
    const hasValue = computed(() => Object.values(localValue.value).some((value) => value !== undefined));

    watch(
      () => props.modelValue,
      (value) => {
        if (value === formatDuration(localValue.value) || value === formatDraftDuration(localValue.value)) {
          return;
        }
        localValue.value = parseDuration(value);
      },
      { immediate: true }
    );

    function updateDraftPart(part: DurationPart, value: unknown) {
      localValue.value = {
        ...localValue.value,
        [part]: normalizeDurationPart(value, part)
      };
      emit('update:model-value', formatDraftDuration(localValue.value));
    }

    function commitDuration() {
      localValue.value = normalizeDurationParts(localValue.value);
      emit('update:model-value', formatDuration(localValue.value));
    }

    function handleFocusedUpdate(isFocused: boolean) {
      if (!isFocused) {
        commitDuration();
      }
    }

    function clear() {
      localValue.value = { ...EMPTY_DURATION };
      emit('update:model-value', undefined);
    }

    return {
      durationParts,
      localValue,
      hasValue,
      updateDraftPart,
      commitDuration,
      handleFocusedUpdate,
      clear,
      getControlErrorMessages,
      last,
      mdiCloseCircle,
      t
    };
  }
});
</script>

<style lang="scss" scoped>
.vf-input-duration {
  margin-bottom: 16px;
}

.vf-input-duration__label {
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.vf-input-duration__container {
  padding: 16px;
}

.vf-input-duration__inputs {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
}

.vf-input-duration__field {
  flex: 1 1 90px;
  min-width: 90px;
  max-width: 130px;
}

.vf-input-duration__field-label {
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.vf-input-duration__input {
  width: 100%;
}

.vf-input-duration__input :deep(input) {
  text-indent: 8px;
}

.vf-input-duration__error {
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 700px) {
  .vf-input-duration__inputs {
    gap: 10px;
  }
}

@media (max-width: 520px) {
  .vf-input-duration__inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .vf-input-duration__field {
    max-width: none;
  }

  .vf-input-duration__clear {
    align-self: flex-end;
  }
}
</style>

<i18n src="~/locales/base/components/dynamic-form-controls-input-duration.json"></i18n>
