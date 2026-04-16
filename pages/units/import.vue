<!--
verinice.veo web
Copyright (C) 2026 djm

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage
    id="unit-import-wizard"
    class="pt-6"
    data-component-name="unit-import-wizard"
    data-veo-test="unit-import-wizard"
    sticky-footer
  >
    <BaseContainer>
      <v-stepper v-model="step" style="width: 100%">
        <v-stepper-header>
          <v-stepper-item :title="t('importUnitStep')" :value="1" />
          <v-divider />
          <v-stepper-item :title="t('editStep')" :value="2" />
          <v-divider />
          <v-stepper-item :title="t('summary')" :value="3" />
        </v-stepper-header>
      </v-stepper>

      <v-window v-model="step" class="my-6" style="width: 100%">
        <v-window-item :value="1">
          <BaseCard border>
            <v-divider />
            <v-card-text class="pa-8">
              <v-file-upload
                :browse-text="t('selectFile')"
                :divider-text="t('or')"
                :icon="mdiTrayArrowUp"
                :title="t('dropzoneTitle')"
                density="default"
                scrim="primary"
                accept=".json,.zip"
                :show-selection="false"
                :multiple="false"
                class="drop-zone bg-surface"
                :class="{ 'drop-zone-active': isDragging }"
                :aria-label="t('dropzoneTitle')"
                data-component-name="unit-import-file-upload"
                :disabled="isParsing"
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @update:model-value="handleFileSelection"
                @click.prevent="triggerFileUpload"
              >
                <template #browse="{}">
                  <v-btn color="primary" variant="flat" size="large">
                    {{ t('selectFile') }}
                  </v-btn>
                </template>
                <template #item="{ props: itemProps }">
                  <v-file-upload-item v-bind="itemProps" lines="one" nav />
                </template>
              </v-file-upload>

              <div v-if="selectedFileName" class="selected-file mt-4" data-veo-test="unit-import-selected-file">
                <span class="text-medium-emphasis">{{ t('selectedFile') }}</span>
                <v-chip color="primary" variant="outlined">
                  {{ selectedFileName }}
                </v-chip>
              </div>

              <input
                ref="fileInputRef"
                data-veo-test="unit-import-file-input"
                type="file"
                accept=".json,.zip"
                style="display: none"
                @change="handleNativeInputChange"
              />

              <p class="text-medium-emphasis text-body-2 mt-4 mb-0 text-center">
                {{ t('acceptedFormats') }}
              </p>
            </v-card-text>
          </BaseCard>
        </v-window-item>

        <v-window-item :value="2">
          <v-card class="my-3">
            <v-alert type="info" variant="tonal" :title="t('hint.edit')" :text="t('explanation.edit')" />
          </v-card>

          <UnitDetails v-model="unitDetails" />
        </v-window-item>

        <v-window-item :value="3">
          <v-card class="my-3">
            <v-alert type="info" variant="tonal" :title="t('explanation.summary')" :text="t('hint.summary')" />
          </v-card>

          <BaseCard border>
            <v-card-title class="text-primary">
              {{ t('reviewAndFinalize') }}
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <div class="summary-row">
                <div class="summary-label">{{ t('unitNameLabel') }}</div>
                <div class="summary-value">{{ unitDetails.name || t('notAvailable') }}</div>
              </div>

              <v-divider class="my-4" />

              <div class="summary-row">
                <div class="summary-label">{{ t('descriptionLabel') }}</div>
                <div class="summary-value">{{ unitDetails.description || t('noDescription') }}</div>
              </div>

              <v-divider class="my-4" />

              <div class="summary-row">
                <div class="summary-label">{{ t('importedFile') }}</div>
                <div class="summary-value">
                  <v-chip color="primary" variant="outlined">
                    {{ selectedFileName || t('notAvailable') }}
                  </v-chip>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="summary-row">
                <div class="summary-label">{{ t('importStats') }}</div>
                <div class="summary-value">
                  {{ t('importStatsValue', [domainCount, elementCount]) }}
                </div>
              </div>
            </v-card-text>
          </BaseCard>
        </v-window-item>
      </v-window>

      <BaseAlert
        v-if="localValidation.errors.length"
        class="mb-4"
        :model-value="true"
        flat
        no-close-button
        :title="t('localErrorsTitle')"
        :type="VeoAlertType.ERROR"
      >
        <div v-for="message in localValidation.errors" :key="message" class="mb-1">
          {{ message }}
        </div>
      </BaseAlert>

      <BaseAlert
        v-if="localValidation.warnings.length"
        class="mb-4"
        :model-value="true"
        flat
        no-close-button
        :title="t('localWarningsTitle')"
        :type="VeoAlertType.WARNING"
      >
        <div v-for="message in localValidation.warnings" :key="message" class="mb-1">
          {{ message }}
        </div>
      </BaseAlert>

      <BaseAlert
        v-if="backendMessages.length"
        class="mb-4"
        :model-value="true"
        flat
        no-close-button
        :title="t('backendMessagesTitle')"
        :type="VeoAlertType.ERROR"
      >
        <div v-for="message in backendMessages" :key="message" class="mb-1">
          {{ message }}
        </div>
      </BaseAlert>
    </BaseContainer>

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn v-if="step > 1" size="large" class="my-6" @click="handleBackClick">
          {{ globalT('global.button.back') }}
        </v-btn>
        <v-btn v-if="step === 1" to="/units" size="large" class="my-6" @click="blurActiveElement">
          {{ t('goToUnitAdmin') }}
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="step < 3"
          data-veo-test="import-unit-next-btn"
          size="large"
          class="my-6"
          color="primary"
          :disabled="!canClickNext"
          @click="handleNextClick"
        >
          {{ globalT('global.button.next') }}
        </v-btn>
        <v-btn
          v-if="step === 3"
          data-veo-test="import-unit-submit-btn"
          size="large"
          class="my-6"
          color="primary"
          :prepend-icon="mdiTrayArrowUp"
          :disabled="!canSubmit"
          @click="handleImportClick"
        >
          {{ t('importUnit') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import JSZip from 'jszip';
import { mdiTrayArrowUp } from '@mdi/js';
import { VFileUploadItem } from 'vuetify/labs/VFileUpload';
import { VeoAlertType } from '~/types/VeoTypes';

import type { UnitDetails as TUnitDetails } from '~/components/unit/Details.vue';
import type { TVeoUnitImportPayload } from '~/composables/requests/useUnits';
import { useImportUnit } from '~/composables/requests/useUnits';
import { extractUnitImportErrorMessages, validateUnitImportPayload } from '~/composables/unitImport';

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { ability } = useVeoPermissions();
const { setLoading, clearLoading } = useGlobalLoadingState();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const router = useRouter();

const step = ref(1);
const isDragging = ref(false);
const isParsing = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const importPayload = ref<TVeoUnitImportPayload>();
const backendMessages = ref<string[]>([]);
const unitDetails = ref<TUnitDetails>({
  name: '',
  description: ''
});

const hasRightToCreateUnits = computed(() => ability.value.can('create', 'unit'));
const selectedFileName = computed(() => selectedFile.value?.name ?? '');
const domainCount = computed(() => importPayload.value?.domains?.length ?? 0);
const elementCount = computed(() => importPayload.value?.elements?.length ?? 0);

const preparedImportPayload = computed<TVeoUnitImportPayload | undefined>(() => {
  if (!importPayload.value) return undefined;

  const payload = JSON.parse(JSON.stringify(importPayload.value)) as TVeoUnitImportPayload;
  payload.unit = {
    ...payload.unit,
    name: unitDetails.value.name?.trim() || payload.unit?.name || '',
    description: unitDetails.value.description ?? ''
  };

  return payload;
});

const localValidation = computed(() => validateUnitImportPayload(preparedImportPayload.value, t));

const { mutateAsync: importUnit } = useImportUnit(preparedImportPayload);

const canClickNext = computed(() => {
  if (!hasRightToCreateUnits.value) return false;
  if (step.value === 1) return !!importPayload.value && localValidation.value.errors.length === 0;
  if (step.value === 2) return !!unitDetails.value.name?.trim();
  return false;
});

const canSubmit = computed(
  () =>
    hasRightToCreateUnits.value &&
    !!preparedImportPayload.value &&
    !!unitDetails.value.name?.trim() &&
    localValidation.value.errors.length === 0
);

watch(importPayload, (payload) => {
  if (!payload?.unit) return;

  unitDetails.value = {
    name: payload.unit.name ?? '',
    description: payload.unit.description ?? ''
  };
  backendMessages.value = [];
});

async function handleFileSelection(files: File | File[] | FileList | null) {
  const file = extractFile(files);
  if (!file) return;

  await processSelectedFile(file);
}

async function handleNativeInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  await processSelectedFile(file);
  resetFileInput();
}

async function processSelectedFile(file: File) {
  backendMessages.value = [];
  isParsing.value = true;

  try {
    const payload = await parseImportFile(file);
    importPayload.value = payload;
    selectedFile.value = file;
  } catch (error) {
    importPayload.value = undefined;
    selectedFile.value = null;
    const messages = extractUnitImportErrorMessages(error);
    backendMessages.value = messages.length ? messages : [t('fileReadError')];
    displayErrorMessage(t('fileReadErrorTitle'), backendMessages.value[0]);
  } finally {
    isParsing.value = false;
  }
}

async function parseImportFile(file: File): Promise<TVeoUnitImportPayload> {
  const lowerCaseName = file.name.toLowerCase();
  const rawContent = lowerCaseName.endsWith('.zip') ? await extractJsonFromZip(file) : await file.text();
  const parsed = JSON.parse(rawContent) as TVeoUnitImportPayload;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(t('invalidImportStructure'));
  }

  return parsed;
}

async function extractJsonFromZip(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const jsonFiles = Object.values(zip.files)
    .filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!jsonFiles.length) {
    throw new Error(t('noJsonInZip'));
  }

  return await jsonFiles[0]!.async('string');
}

function extractFile(input: File | File[] | FileList | null): File | null {
  if (!input) return null;
  if (input instanceof File) return input;
  if (input instanceof FileList) return input[0] ?? null;
  if (Array.isArray(input)) return input[0] ?? null;
  return null;
}

async function handleImportClick() {
  if (!canSubmit.value) return;

  let loaderId: symbol | undefined;
  backendMessages.value = [];

  try {
    loaderId = setLoading(t('isImportingUnit'));
    await importUnit();
    displaySuccessMessage(t('importSuccess'));
    await router.push({ name: 'units' });
  } catch (error) {
    backendMessages.value = extractUnitImportErrorMessages(error);
    if (!backendMessages.value.length) {
      backendMessages.value = [t('importErrorBody')];
    }
    displayErrorMessage(t('importErrorTitle'), backendMessages.value[0]);
  } finally {
    if (loaderId) {
      clearLoading(loaderId);
    }
  }
}

function handleBackClick() {
  step.value--;
  blurActiveElement();
}

function handleNextClick() {
  if (!canClickNext.value) return;
  step.value++;
  blurActiveElement();
}

function blurActiveElement() {
  const activeElement = document.activeElement as HTMLElement | null;
  activeElement?.blur();
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function resetFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;

  event.preventDefault();
  if (step.value < 3 && canClickNext.value) {
    step.value++;
    return;
  }

  if (step.value === 3 && canSubmit.value) {
    handleImportClick();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEnterPress);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEnterPress);
});

useHead({
  title: t('pageTitle')
});
</script>

<i18n src="~/locales/base/pages/units-import.json"></i18n>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.35);
  border-radius: 8px;
  min-height: 240px;
  max-width: 700px;
  align-items: center;
  margin: 0 auto;
}

.drop-zone-active {
  border-color: rgb(var(--v-theme-primary));
}

.selected-file {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.summary-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-value {
  font-size: 1.125rem;
}
</style>
