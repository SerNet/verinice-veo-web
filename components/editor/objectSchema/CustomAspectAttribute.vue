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
  <BaseCard class="mb-6">
    <v-list-item>
      <v-row>
        <v-col
          :cols="8"
          class="py-0"
        >
          <v-text-field
            :model-value="form.data.title"
            :label="`${t('aspectName')} *`"
            :rules="[requiredRule, banSpecialChars]"
            :prefix="prefix"
            variant="underlined"
            @update:model-value="doUpdate($event, 'title')"
          />
        </v-col>
        <v-col
          :cols="4"
          class="py-0"
        >
          <v-select
            :model-value="form.data.type"
            :label="t('aspectType')"
            :items="types"
            variant="underlined"
            @update:model-value="doUpdate($event, 'type')"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col class="py-0">
          <v-text-field
            :model-value="form.data.description"
            :label="t('aspectDescription')"
            clearable
            variant="underlined"
            @update:model-value="doUpdate($event, 'description')"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="form.data.type === 'enum'"
        class="flex-column"
        dense
      >
        <v-col class="py-0 d-flex align-center">
          <h4 class="text-h4">
            {{ t('values') }}
          </h4>
          <v-checkbox
            v-model="form.data.multiple"
            dense
            hide-details
            :label="t('multiple')"
            class="mt-0 pt-0 ml-4"
            @update:model-value="doUpdate($event, 'multiple')"
          />
        </v-col>
        <v-col class="py-0">
          <v-combobox
            :model-value="form.data.enum"
            chips
            multiple
            disable-lookup
            hide-no-data
            append-icon=""
            clearable
            variant="underlined"
            @update:model-value="doUpdate($event, 'enum')"
          >
            <template #label>
              <span>
                {{ t('valuesHint') }}
              </span>
            </template>
            <template #selection="data">
              <v-chip
                :key="JSON.stringify(data.item)"
                v-bind="data.attrs"
                close
                @click:close="removeValueFromEnum(data.item)"
              >
                {{ data.item }}
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
      <v-row
        v-if="formatOptions.length > 0"
        class="flex-column"
      >
        <v-col class="py-0">
          <v-select
            :model-value="currentFormatOption"
            :label="t('inputFormat')"
            :items="formatOptions"
            item-title="displayName"
            item-value="name"
            variant="underlined"
            @update:model-value="updateOptions($event)"
          />
        </v-col>
      </v-row>
      <template #append>
        <v-list-item-action>
          <v-btn
            variant="text"
            :icon="mdiTrashCanOutline"
            @click="doDelete()"
          />
        </v-list-item-action>
      </template>
    </v-list-item>
  </BaseCard>
</template>

<script lang="ts">
import { mdiTrashCanOutline } from '@mdi/js';
import { cloneDeep, trim } from 'lodash';
import { INPUT_TYPES } from '~/types/VeoEditor';
import { useRules } from '~~/composables/utils';

interface IInputFormat {
  name: string;
  options: {
    [key: string]: string | undefined;
  };
}

interface IInputFormats {
  [key: string]: IInputFormat[];
}

const INPUT_FORMATS: IInputFormats = {
  string: [
    {
      name: 'text',
      options: {
        format: undefined,
        pattern: undefined
      }
    },
    {
      name: 'date',
      options: {
        format: 'date',
        pattern: undefined
      }
    },
    {
      name: 'dateTime',
      options: {
        format: 'date-time',
        pattern: undefined
      }
    },
    {
      name: 'uri',
      options: {
        format: 'uri',
        pattern: '^(https?|ftp)://'
      }
    }
  ]
};

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'enum'
    },
    description: {
      type: String,
      default: ''
    },
    aspectName: {
      type: String,
      required: true
    },
    enum: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: undefined
    },
    pattern: {
      type: String,
      default: undefined
    },
    originalId: {
      type: String,
      default: undefined
    }
  },
  emits: ['delete', 'update'],
  setup(props, context) {
    const { t } = useI18n();
    const prefix = computed(() => props.aspectName + '_');

    const { banSpecialChars, requiredRule } = useRules();

    watch(
      props,
      (newValue: any) => {
        form.value.data = { ...newValue };
        nextTick().then(() => {
          form.value.data.multiple = newValue.multiple;
        });
      },
      {
        deep: true
      }
    );
    const form = ref({
      data: {
        ...props
      },
      rules: {
        title: [(value: string) => trim(value).length > 0]
      }
    });

    nextTick().then(() => {
      form.value.data.multiple = props.multiple;
    });

    const types = computed(() => {
      const dummy: { title: string; value: string }[] = [];
      const availableTypes = INPUT_TYPES as any;
      for (const entry in availableTypes) {
        if (!['null', 'unknown', 'array', 'object'].includes(availableTypes[entry].name)) {
          dummy.push({
            title: t(`editor.inputtypes.${availableTypes[entry].name}`) as string,
            value: availableTypes[entry].name
          });
        }
      }
      return dummy;
    });

    function doDelete() {
      context.emit('delete');
    }

    function doObjectUpdate(newObject: any) {
      const object = { ...form.value.data, originalId: props.originalId } as any;

      // Delete properties only used for ui
      delete object.aspectName;

      // Iterate over every element in the new object. If set to undefined, delete the key, else set the value for the update.
      for (const key in newObject) {
        if (newObject[key] === undefined) {
          delete object[key];
        } else {
          object[key] = newObject[key];
        }
      }

      // If the object type changes, we have to delete all custom properties belonging to the previous type
      if (newObject.type && newObject.type !== form.value.data.type) {
        const newProperties = INPUT_FORMATS[newObject.type]?.find((item) => !item.options.format)?.options || {};
        const oldProperties = INPUT_FORMATS[form.value.data.type]?.find((item) => item.options.format === form.value.data.format)?.options || {};

        // Iterate over new
        for (const key in object) {
          if (oldProperties[key] && !newProperties[key]) {
            delete object[key];
          }
        }
      }
      context.emit('update', object);
    }

    function doUpdate(value: any, property: string) {
      doObjectUpdate({ [property]: value });
    }

    // special operations for enums
    const attributeTypes = ref([
      { title: 'Zahl', value: 'number' },
      { title: 'Ganzzahl', value: 'integer' },
      { title: 'Text', value: 'string' }
    ]);

    function removeValueFromEnum(value: string) {
      doUpdate(
        props.enum.filter((entry) => entry !== value),
        'enum'
      );
    }

    function updateOptions(formatType: string) {
      const object = cloneDeep(formatOptions.value.find((item) => item.name === formatType));
      if (object) {
        doObjectUpdate(object.options);
      }
    }

    // Special operations for all types
    const formatOptions = computed<IInputFormat[]>(() => {
      return (INPUT_FORMATS[form.value.data.type] || []).map((entry: any) => {
        entry.displayName = t(`attributeTypes.${entry.name}`);
        return entry;
      });
    });

    const currentFormatOption = computed<string | undefined>(() => {
      // We have to iterate over every object in the formatOptions array and only if the format property matches, we have the correct one.
      return formatOptions.value.find((item) => item.options.format === form.value.data.format)?.name;
    });

    return {
      prefix,
      form,
      types,
      doDelete,
      doUpdate,
      attributeTypes,
      formatOptions,
      removeValueFromEnum,
      updateOptions,
      currentFormatOption,

      mdiTrashCanOutline,
      t,
      banSpecialChars,
      requiredRule
    };
  }
});
</script>

<i18n>
{
  "en": {
    "multiple": "Multiple",
    "aspectDescription": "Description",
    "aspectName": "attribute name",
    "aspectType": "Attribute type",
    "inputFormat": "Input format",
    "values": "Available options",
    "valuesHint": "Available options (seperate entries with Enter)",
    attributeTypes: {
      date: 'Date',
      dateTime: 'Date and Time',
      text: 'Text',
      uri: 'URI'
    }
  },
  "de": {
    "multiple": "Mehrfachauswahl",
    "aspectDescription": "Beschreibung",
    "aspectName": "Name des Attributs",
    "aspectType": "Typ des Attributs",
    "inputFormat": "Eingabeformat",
    "values": "Auswahlmöglichkeiten",
    "valuesHint": "Werte (mit Enter trennen)",
    attributeTypes: {
      date: 'Datum',
      dateTime: 'Datum und Uhrzeit',
      text: 'Text',
      uri: 'URI'
    }
  }
}
</i18n>

