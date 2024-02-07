<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-row class="mb-1">
    <v-col cols="12" md="4">
      <VTextField
        v-model="searchQuery"
        :label="t('searchTranslations')"
        density="compact"
        single-line
        hide-details
        variant="solo"
        flat
      />
    </v-col>
    <slot name="controls" />
  </v-row>
  <BaseCard>
    <div ref="tableWrapper">
      <BaseTable
        :additional-headers="headers"
        :items="transformedTranslations"
        :search="searchQuery"
        :sort-by="[{ key: 'key', order: 'asc' }]"
      >
        <template #no-data>
          <slot name="no-data" v-bind="{ searchQuery }" />
        </template>
      </BaseTable>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { VBtn, VTextField, VTooltip } from 'vuetify/lib/components/index.mjs';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

import { TableHeader } from '~/components/base/Table.vue';
import { IEditorTranslations, TRANSLATION_SOURCE } from './types';
import { mdiContentCopy, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { cloneDeep } from 'lodash';

interface ITranslationsItem {
  key: string;
  source: string; // String containing the indexes of TRANSLATION_SOURCE. !!USE PARSEINT WHEN TRYING TO COMPARE WITH ENUM!!
  [locale: string]: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: IEditorTranslations;
    sources?: TRANSLATION_SOURCE[];
    modifieableSources?: TRANSLATION_SOURCE[];
  }>(),
  {
    modelValue: () => ({}),
    sources: () => [TRANSLATION_SOURCE.UNSPECIFIED],
    modifieableSources: () => []
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: IEditorTranslations): void;
  (e: 'translation-deleted', payload: { key: string; source: string }): void;
}>();

const { t, locales } = useI18n();
const { requiredRule } = useRules();

const searchQuery = ref('');

const editedLanguageItem = ref<{ key: string; source: string; locale: string } | undefined>(undefined);
const ignoreBlurEvent = ref(false);

// Navigate table with tab and shift+tab
const tableWrapper = ref<HTMLElement | undefined>(undefined);

/**
 * Checks if a column exists in the current row. Overflows to the next row return false.
 *
 * @param delta The delta to apply to the current column index. Negative values check to the left, positive values to the right.
 */
const columnExists = (delta: number) => {
  if (!editedLanguageItem.value) {
    return false;
  }
  const locales = Object.keys(
    props.modelValue[editedLanguageItem.value.key][editedLanguageItem.value.source as any as TRANSLATION_SOURCE]
  );
  const currentLocaleIndex = locales.indexOf(editedLanguageItem.value.locale);

  return currentLocaleIndex + delta <= locales.length - 1 && currentLocaleIndex + delta >= 0;
};

/**
 * Focus a column
 * NOTE: Please check whether the column to select is in bounds using columnExists before calling this function!
 *
 * @param delta The delta to apply to the current column index. Negative values move the focus to the left, positive values to the right.
 */
const focusColumn = (delta: number) => {
  if (!editedLanguageItem.value) {
    return;
  }
  const locales = Object.keys(
    props.modelValue[editedLanguageItem.value.key][editedLanguageItem.value.source as any as TRANSLATION_SOURCE]
  );
  const localeIndex = locales.indexOf(editedLanguageItem.value.locale);

  ignoreBlurEvent.value = true;
  editedLanguageItem.value.locale = Object.keys(
    props.modelValue[editedLanguageItem.value.key][editedLanguageItem.value.source as any as TRANSLATION_SOURCE]
  )[localeIndex + delta];
};

/**
 * Focuses a row. Also checks for out of bounds.
 *
 * @param delta The delta to apply to the current row index. Negative values move the focus up, positive values down.
 */
const focusRow = (delta: number) => {
  const visibleRows = tableWrapper.value?.querySelectorAll('tr');
  if (!visibleRows) {
    return;
  }
  const rowIndexWithFocus = Array.from(visibleRows?.values()).findIndex((row) => row.contains(document.activeElement));
  // If the new row is out of bounds, do nothing
  if (rowIndexWithFocus + delta > visibleRows.length - 1 || rowIndexWithFocus + delta < 1) {
    return;
  }
  const rowToFocus = visibleRows[rowIndexWithFocus + delta];
  const rowToFocusKey = rowToFocus.children[0].textContent;
  let rowToFocusScope;
  switch (rowToFocus.children[1].textContent) {
    case t('formschema'):
      rowToFocusScope = TRANSLATION_SOURCE.FORMSCHEMA;
      break;
    case t('objectschema'):
      rowToFocusScope = TRANSLATION_SOURCE.OBJECTSCHEMA;
      break;
    default:
      rowToFocusScope = TRANSLATION_SOURCE.UNSPECIFIED;
  }
  if (!rowToFocusKey || rowToFocusScope === TRANSLATION_SOURCE.UNSPECIFIED) {
    return;
  }

  const locales = Object.keys(props.modelValue[rowToFocusKey][rowToFocusScope as any as TRANSLATION_SOURCE]);

  ignoreBlurEvent.value = true;
  editedLanguageItem.value = {
    key: rowToFocusKey,
    source: `${rowToFocusScope}`,
    locale: delta > 0 ? locales[0] : locales[locales.length - 1]
  };
};

/**
 * Focuses the next item based on the delta in the table. If needed switches rows.
 *
 * @param delta The delta to apply to the current item index. Negative values move the focus to the left, positive values to the right.
 */
const focusItem = (delta: number) => {
  if (!editedLanguageItem.value) {
    return;
  }
  if (columnExists(delta)) {
    focusColumn(delta);
  } else {
    focusRow(delta);
  }
};

/**
 * Creates the table cell for all locale entries. Displays as text until clicked upon, then turns into a text field.
 *
 * @param itemProps Data for the current item including meta data.
 * @param locale The locale to render for.
 */
const renderLanguageItem = (itemProps: any, locale: string) => {
  const itemKey: string = itemProps.item.raw.key;
  const itemSource: string = itemProps.item.raw.source;
  const isEditedLanguageItem = computed(
    () =>
      editedLanguageItem.value?.key === itemKey &&
      editedLanguageItem.value?.source === itemSource &&
      editedLanguageItem.value?.locale === locale
  );
  const isModifiable = props.modifieableSources.includes(parseInt(itemSource, 10));

  return isEditedLanguageItem.value ?
      h(VTextField, {
        modelValue: itemProps.item.raw[locale],
        dense: true,
        autofocus: true,
        hideDetails: true,
        rules: [requiredRule],
        variant: 'underlined',
        'onUpdate:modelValue': (newValue: string) => {
          const toReturn = cloneDeep(props.modelValue);
          toReturn[itemKey][itemSource as any as TRANSLATION_SOURCE][locale] = newValue; // Objects can't have numeric keys, so our enum value gets cast to a string
          emit('update:modelValue', toReturn);
        },
        onBlur: () => {
          if (ignoreBlurEvent.value) {
            ignoreBlurEvent.value = false;
            return;
          }
          editedLanguageItem.value = undefined;
        },
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            editedLanguageItem.value = undefined;
          }
          if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
              focusItem(-1);
            } else {
              focusItem(1);
            }
          }
        }
      })
    : h(
        'div',
        {
          class: {
            'd-flex align-center justify-space-between text-no-wrap': true,
            'veo-cursor-pointer': isModifiable
          },
          onClick: () =>
            isModifiable ?
              (editedLanguageItem.value = {
                key: itemKey,
                source: itemSource,
                locale
              })
            : () => ({})
        },
        isModifiable ?
          [
            itemProps.item.raw[locale],
            h(VBtn, {
              icon: mdiPencilOutline,
              size: 'small',
              variant: 'plain'
            })
          ]
        : itemProps.item.raw[locale]
      );
};

const headers = computed<TableHeader[]>(() => [
  {
    key: 'key',
    order: 10,
    priority: 100,
    value: 'key',
    text: t('key'),
    render: (itemProps) => {
      const itemSource: string = itemProps.item.raw.source;
      const isModifiable = props.modifieableSources.includes(parseInt(itemSource, 10));
      return h(
        'div',
        {
          class: 'd-flex align-center justify-space-between text-no-wrap'
        },
        [
          itemProps.item.raw.key,
          isModifiable ?
            h(VBtn, {
              icon: mdiTrashCanOutline,
              size: 'small',
              variant: 'plain',
              onClick: () => {
                const toReturn = cloneDeep(props.modelValue);
                delete toReturn[itemProps.item.raw.key][itemSource as any as TRANSLATION_SOURCE];
                emit('update:modelValue', toReturn);
                emit('translation-deleted', {
                  key: itemProps.item.raw.key,
                  source: itemSource
                });
              }
            })
          : !props.modelValue[itemProps.item.raw.key][TRANSLATION_SOURCE.FORMSCHEMA] ?
            h(
              VTooltip,
              {
                location: 'bottom'
              },
              {
                activator: ({ props: slotProps }: { props: any }) =>
                  h(VBtn, {
                    icon: mdiContentCopy,
                    size: 'small',
                    variant: 'plain',
                    onClick: () => {
                      const toReturn = cloneDeep(props.modelValue);
                      for (const source of props.modifieableSources) {
                        toReturn[itemProps.item.raw.key][source] = cloneDeep(
                          toReturn[itemProps.item.raw.key][itemSource as any as TRANSLATION_SOURCE]
                        );
                      }
                      emit('update:modelValue', toReturn);
                    },
                    ...slotProps
                  }),
                default: () => t('createEditableTranslation')
              }
            )
          : undefined
        ]
      );
    }
  },
  {
    key: 'source',
    order: 20,
    priority: 100,
    value: 'source',
    text: t('source'),
    render: (props) => {
      switch (parseInt(props.item.raw.source)) {
        case TRANSLATION_SOURCE.FORMSCHEMA:
          return t('formschema');
        case TRANSLATION_SOURCE.OBJECTSCHEMA:
          return t('objectschema');
        default:
          return t('unknown');
      }
    }
  },
  ...(locales.value as LocaleObject[]).map((locale) => ({
    key: locale.code,
    order: 30,
    priority: 100,
    value: locale.code,
    text: t('value', [locale.code]),
    render: (props: any) => renderLanguageItem(props, locale.code)
  }))
]);

// Turn the translations object into an array of objects
const transformedTranslations = computed(() =>
  Object.entries(cloneDeep(props.modelValue)).reduce((translationsAsArray, [key, value]) => {
    Object.entries(value).forEach(([source, translations]) => {
      // If the current source shouldn't be displayed, skip it
      if (
        props.sources.length &&
        !props.sources.includes(TRANSLATION_SOURCE.UNSPECIFIED) &&
        !props.sources?.includes(parseInt(source))
      ) {
        return;
      }
      translationsAsArray.push({
        key,
        source,
        ...translations
      });
    });
    return translationsAsArray;
  }, [] as ITranslationsItem[])
);
</script>

<i18n>
{
  "en": {
    "createEditableTranslation": "Create an editable translation based on this translation",
    "formschema": "Form schema",
    "key": "Key",
    "objectschema": "Object schema",
    "searchTranslations": "Search translations",
    "source": "Source",
    "unknown": "Unknown",
    "value": "Value ({0})"
  },
  "de": {
    "createEditableTranslation": "Editierbare Übersetzung basierend auf dieser Übersetzung erstellen",
    "formschema": "Formschema",
    "key": "Schlüssel",
    "objectschema": "Objektschema",
    "searchTranslations": "Übersetzungen durchsuchen",
    "source": "Quelle",
    "unknown": "Unbekannt",
    "value": "Wert ({0})"
  }
}
</i18n>
