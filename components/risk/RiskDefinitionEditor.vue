<!--
   - verinice.veo web
   - Copyright (C) 2024 jae
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
  <v-card min-width="640" class="pb-4">
    <div class="d-flex flex-column">
      <template v-if="!data.length">
        <slot name="infoBox"></slot>
      </template>
      <v-tabs v-else v-model="translationTab" color="primary" direction="horizontal" class="mb-4">
        <v-tab v-for="translation in Object.keys(data?.[0]?.translations ?? {})" :key="translation">
          {{ translation }}
        </v-tab>
      </v-tabs>
      <v-tabs-window v-model="translationTab">
        <v-tabs-window-item
          v-for="(translation, index) in Object.keys(data?.[0]?.translations ?? {})"
          :key="translation"
        >
          <v-tabs v-model="tab" color="primary" direction="vertical">
            <v-tab
              v-for="(item, idx) in data ?? []"
              :key="`${item.ordinalValue}-${idx}`"
              :text="item.translations[translation]?.name"
            >
              <template #prepend>
                <v-icon :color="item.htmlColor" :icon="mdiSquare" size="large" />
              </template>
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-btn variant="outlined" class="add-btn" @click="addItem"> + {{ t('addItem') }} </v-btn>
            <v-tabs-window-item
              v-for="(item, itemIndex) in data"
              :key="itemIndex"
              :text="item.translations[translation].name"
            >
              <v-container fluid>
                <v-form>
                  <!-- Name -->
                  <v-text-field
                    v-model="item.translations[translation].name"
                    :label="t('inputLabel.name')"
                    hide-details
                    required
                    @input="() => changeItem(itemIndex)"
                  >
                    <template #append-inner>
                      <v-btn
                        :icon="mdiDeleteOutline"
                        :aria-label="t('removeItem')"
                        @click="() => removeItem(itemIndex)"
                      />
                    </template>
                  </v-text-field>

                  <!-- Description -->
                  <v-textarea
                    v-model="item.translations[translation].description"
                    :label="t('inputLabel.description')"
                    @input="() => changeItem(itemIndex)"
                  />

                  <!-- Color picker -->
                  <v-row justify="center" align="center">
                    <v-col style="min-width: 220px">
                      <v-text-field v-model="item.htmlColor" class="ma-0 pa-0" variant="solo" readonly>
                        <template #prepend-inner>
                          <v-menu
                            :model-value="isColorMenuOpen(index + '-' + itemIndex)"
                            top
                            nudge-bottom="105"
                            nudge-left="16"
                            :close-on-content-click="false"
                            @update:model-value="(val) => handleMenuUpdate(index + '-' + itemIndex, val)"
                          >
                            <template #activator="{ props }">
                              <div
                                v-bind="props"
                                :style="{ ...swatchStyle, backgroundColor: item.htmlColor || defaultSwatchColor }"
                              />
                            </template>
                            <v-card>
                              <v-card-text class="pa-0">
                                <v-color-picker
                                  v-model="item.htmlColor"
                                  flat
                                  @update:model-value="formIsDirty = true"
                                />
                              </v-card-text>
                            </v-card>
                          </v-menu>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { mdiSquare, mdiDeleteOutline } from '@mdi/js';
import { IVeoRiskPotentialImpact } from '~/types/VeoTypes';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save-editor'): void;
  (e: 'add-item'): void;
  (e: 'remove-item', index: number): void;
  (e: 'change-item', index: number): void;
}>();

const { t } = useI18n();

// State
const data = defineModel<IVeoRiskPotentialImpact[]>('data', { default: [] });
const formIsDirty = defineModel<boolean>('isDirty', { default: false });

const tab = ref(0);
const translationTab = ref(0);
const colorMenuStates = ref(new Map<string | number, boolean>());

const defaultSwatchColor = '#ff0000';
const swatchStyle = computed(() => {
  return {
    backgroundColor: defaultSwatchColor,
    cursor: 'pointer',
    height: '30px',
    width: '30px',
    borderRadius: '4px',
    transition: 'border-radius 200ms ease-in-out'
  };
});

function isColorMenuOpen(id: string | number) {
  return colorMenuStates.value.get(id) || false;
}

function handleMenuUpdate(id: string | number, value: boolean) {
  if (value) {
    colorMenuStates.value.set(id, true);
  } else {
    colorMenuStates.value.delete(id);
  }
}

function addItem() {
  emit('add-item');
  nextTick(() => {
    tab.value = data.value.length - 1;
  });
}

function changeItem(itemIndex: number) {
  emit('change-item', itemIndex);
}

function removeItem(itemIndex: number) {
  emit('remove-item', itemIndex);
  nextTick(() => {
    tab.value = 0;
  });
}
</script>
<style scoped lang="scss">
.add-btn {
  margin: auto;
  max-width: calc(100% - 32px);
  border: 2px dashed #ccc;
  color: #666;
  margin-top: 8px;
  width: 100%;
}
</style>
