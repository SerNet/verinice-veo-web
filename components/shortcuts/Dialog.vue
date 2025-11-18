<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div>
    <BaseDialog
      :model-value="modelValue"
      :title="t('title')"
      :width="800"
      fixed-footer
      @close="closeDialog"
      @update:model-value="handleModelUpdate"
    >
      <template #default>
        <v-container>
          <header>
            <!-- Dialog Header -->
            <v-row class="mb-2">
              <v-col cols="12">
                <v-list density="compact">
                  <v-list-item>
                    <div class="text-body-2 font-weight-bold d-flex align-center">
                      <span>{{ t('openInstructions') }}</span>
                      <v-chip class="ma-2 d-flex justify-center shortcuts__chip" label>⇧</v-chip>
                      <span>+</span>
                      <v-chip class="ma-2 d-flex justify-center shortcuts__chip" label>?</v-chip>
                    </div>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </header>

          <main>
            <!-- Main Content -->
            <v-row>
              <v-col v-if="shortcuts.length" cols="12">
                <v-card flat>
                  <v-card-title class="text-subtitle-2 py-2">{{ t('domainNavigation') }}</v-card-title>
                  <v-divider/>
                  <v-list density="compact">
                    <template v-for="shortcut in shortcuts" :key="shortcut.id">
                      <v-list-item v-if="!shortcut?.disabled" class="text-body-2">
                        <v-list-item-title class="text-body-2 text-capitalize">
                          {{ shortcut.name ?? '' }}
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="shortcut.description" class="text-caption text-capitalize">
                          {{ shortcut.description ?? '' }}
                        </v-list-item-subtitle>
                        <template #append>
                          <template v-for="(shortcutKey, index) in shortcut.keys" :key="shortcutKey">
                            <v-chip class="ma-2 d-flex justify-center shortcuts__chip" label>{{ shortcutKey }}</v-chip>
                            <span v-if="index < shortcut.keys.length - 1">{{ t('then') }}</span>
                          </template>
                        </template>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-card>
              </v-col>

              <!-- No shortcuts available message -->
              <v-col v-else cols="12" class="text-center">
                <h3 class="text-h6 mb-2 text-medium-emphasis">
                  {{ t('noShortcuts') }}
                </h3>
              </v-col>
            </v-row>
          </main>
        </v-container>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import type { Shortcut } from '~/composables/shortcuts/types';

interface Props {
  modelValue: boolean;
  shortcuts: Shortcut[];
}

defineProps<Props>();

const { t } = useI18n();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function closeDialog() {
  emit('update:modelValue', false);
}

function handleModelUpdate(isOpen: boolean) {
  emit('update:modelValue', isOpen);
}
</script>

<i18n src="~/locales/base/components/shortcuts-dialog.json"></i18n>
<style scoped>
.shortcuts__chip {
  width: 32px;
  height: 32px;
}
</style>
