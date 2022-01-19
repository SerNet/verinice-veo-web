<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div
    v-if="visible && value"
    class="vf-links-field vf-form-element"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div class="d-flex">
      <span
        v-if="options && options.label"
        class="subtitle-1 mb-2"
      >
        {{ options && options.label }}
      </span>
      <v-spacer />
    </div>
    <v-list
      dense
      class="py-0"
    >
      <v-list-item
        v-for="(val, index) in localValue"
        :key="index"
        class="links-field-item my-2 pt-2"
      >
        <v-list-item-content>
          <LinksFieldRow
            v-bind="$props"
            :key="index"
            :index="index"
            :value="val"
            :selected.sync="selected[index]"
            :link-data="value"
            @input="onInput(index, $event)"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            :disabled="!value || disabled"
            depressed
            text
            fab
            small
            @click="removeRow(index)"
          >
            <v-icon>{{ mdiTrashCan }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn
      small
      text
      :disabled="disabled"
      color="primary"
      @click="addRow()"
    >
      <v-icon small>
        {{ mdiPlus }}
      </v-icon>
      <span>{{ t('addLink') }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { JSONSchema7 } from 'json-schema';
import { mdiPlus, mdiTrashCan } from '@mdi/js';
import { cloneDeep } from 'lodash';

import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';
import { BaseObject } from '~/components/forms/utils';
import { IVeoTranslationCollection } from '~/types/VeoTypes';
import { UISchemaElement } from '~/types/UISchema';

export default defineComponent({
  name: 'LinksField',
  props: {
    value: {
      type: Array as PropType<BaseObject[]>,
      default: () => []
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object as PropType<JSONSchema7>,
      default: undefined
    },
    options: {
      type: Object,
      default: undefined
    },
    validation: {
      type: Object,
      default: undefined
    },
    disabled: Boolean,
    visible: Boolean,
    generalTranslation: {
      type: Object as PropType<IVeoTranslationCollection>,
      default: () => {}
    },
    customTranslation: {
      type: Object as PropType<IVeoTranslationCollection>,
      default: () => {}
    },
    elements: {
      type: Array as PropType<UISchemaElement[]>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const selected: Ref<string[]> = ref([]);

    // We want at least one link displayed at all times, however the schema validation would fail if we passed an empty link upwards, so we keep it in here
    const localValue = computed(() => (props.value.length ? props.value : [{}]));

    function addRow() {
      emit('input', [...props.value, {}]);
    }

    function removeRow(rowIndex: number) {
      selected.value.splice(rowIndex, 1);

      const dummy = cloneDeep(props.value);
      dummy.splice(rowIndex, 1);
      emit('input', dummy);
    }

    function onInput(index: number, value: any) {
      const dummy = cloneDeep(props.value);
      dummy[index] = value;
      emit('input', dummy);
    }

    return {
      addRow,
      localValue,
      onInput,
      removeRow,
      selected,

      mdiTrashCan,
      mdiPlus,
      t
    };
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    const schemaItemsProperties =
      props.schema &&
      props.schema.items &&
      typeof props.schema.items === 'object' &&
      !Array.isArray(props.schema.items) &&
      props.schema.items.properties &&
      props.schema.items.properties;
    const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target);
    return calculateConditionsScore([props.schema.type === 'array', typeof props.elements !== 'undefined', isTarget]);
  }
};
</script>

<i18n>
{
  "en": {
    "addLink": "Add link"
  },
  "de": {
    "addLink": "Link hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.links-field-item {
  border: 1px solid $grey;
  border-radius: 4px;
}

.links-field-item ::v-deep .vf-layout {
  padding-left: 0;
  padding-right: 0;
}
</style>
