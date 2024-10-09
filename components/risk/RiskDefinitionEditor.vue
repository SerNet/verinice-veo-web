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
  <v-dialog v-model="isOpen" width="auto" @after-leave="resetTabState" @keydown.enter="saveAndClose">
    <v-card min-width="640">
      <div v-if="form.items?.length" class="d-flex flex-column">
        <v-tabs v-model="translationTab" color="primary" direction="horizontal" class="mb-4">
          <v-tab v-for="translation in Object.keys(form.items?.[0]?.translations ?? {})" :key="translation">
            {{ translation }}
          </v-tab>
        </v-tabs>
        <v-tabs-window v-model="translationTab">
          <h2 style="margin-left: 14px">{{ form?.typeTranslation ?? '' }}</h2>
          <v-tabs-window-item
            v-for="(translation, index) in Object.keys(form.items?.[0]?.translations ?? {})"
            :key="translation"
          >
            <v-tabs v-model="tab" color="primary" direction="vertical">
              <v-tab
                v-for="(item, idx) in form.items ?? []"
                :key="`${item.ordinalValue}-${idx}`"
                :text="item.translations[translation]?.name"
              >
                <template #prepend>
                  <v-icon :color="item.htmlColor" :icon="mdiSquare" size="large" />
                </template>
              </v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
              <v-tabs-window-item
                v-for="(item, indexItems) in form.items"
                :key="indexItems"
                :text="item.translations[translation].name"
              >
                <v-container fluid>
                  <v-form>
                    <!-- Name -->
                    <v-text-field
                      v-model="item.translations[translation].name"
                      :label="$t('inputLabel.name')"
                      hide-details
                      required
                    />

                    <!-- Description -->
                    <v-textarea
                      v-model="item.translations[translation].description"
                      :label="$t('inputLabel.description')"
                    />

                    <!-- Color picker -->
                    <v-row justify="center" align="center">
                      <v-col style="min-width: 220px">
                        <v-text-field v-model="item.htmlColor" class="ma-0 pa-0" variant="solo" readonly>
                          <template #prepend-inner>
                            <v-menu
                              :model-value="isColorMenuOpen(index + '-' + indexItems)"
                              top
                              nudge-bottom="105"
                              nudge-left="16"
                              :close-on-content-click="false"
                              @update:model-value="(val) => handleMenuUpdate(index + '-' + indexItems, val)"
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
                                    @update:model-value="() => updateColor(index + '-' + indexItems)"
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

      <v-card-actions class="justify-space-between">
        <v-btn variant="outlined" :text="$t('global.button.cancel')" @click="isOpen = false" />

        <v-btn
          color="primary"
          variant="outlined"
          :text="$t('global.button.save')"
          :disabled="!formIsDirty"
          @click="
            emit('update-risk-definition');
            isOpen = false;
          "
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiSquare } from '@mdi/js';
import type { TRiskDefinitionPart } from './RiskDefinitionCustomization.module';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update-risk-definition'): void;
}>();

// State
const form = defineModel<TRiskDefinitionPart>('form', { default: [] });
const isOpen = defineModel<boolean>('isOpen', { default: false });
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

function resetTabState() {
  translationTab.value = 0;
  tab.value = 0;
  colorMenuStates.value.clear();
}

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

function updateColor(id: string | number) {
  formIsDirty.value = true;
}

function saveAndClose() {
  emit('update-risk-definition');
  isOpen.value = false;
}
</script>
