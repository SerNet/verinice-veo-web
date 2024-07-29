<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum, Jonas Heitmann
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
  <UtilNotFoundError v-if="!loading && notFoundError" :text="t('notFound')" />
  <LayoutPageWrapper
    v-else
    class="px-4 pt-6 bg-basepage"
    collapsable-left
    collapsable-right
    :loading="loading"
    :page-widths="pageWidths"
    :page-widths-xl="pageWidthsXl"
    :page-widths-lg="pageWidthsLg"
    :page-titles="pageTitles"
    data-component-name="object-details-page"
    @page-collapsed="onPageCollapsed"
  >
    <template #default>
      <BasePage sticky-footer data-component-name="object-details-details" no-padding>
        <template #default>
          <ObjectDetails
            v-model:active-tab="activeTab"
            class="mb-10"
            :loading="loading"
            :object="object.value"
            :domain-id="domainId"
            :dense="!!pageWidths[1]"
            @reload="updateObjectRelationships"
          />
        </template>
        <template #footer>
          <div style="height: 36px" />

          <ObjectActionMenu
            color="primary"
            :disabled="ability.cannot('manage', 'objects')"
            :object="object.value"
            :type="activeTab"
            @reload="updateObjectRelationships"
          />
        </template>
      </BasePage>

      <BasePage content-class="fill-height" no-padding data-component-name="object-details-form">
        <template #default>
          <ObjectForm
            v-if="objectType"
            ref="objectForm"
            v-model="modifiedObject"
            v-model:valid="isFormValid"
            class="pb-4"
            :disabled="formDataIsRevision || ability.cannot('manage', 'objects')"
            :object-type="objectType"
            :original-object="object.value"
            :loading="loading || !modifiedObject"
            :domain-id="domainId"
            :additional-context="additionalContext"
            @show-revision="onShowRevision"
            @create-dpia="createDPIADialogVisible = true"
            @link-dpia="linkObjectDialogVisible = true"
          >
            <template v-if="formDataIsRevision" #prepend-form>
              <BaseAlert
                :model-value="true"
                :type="VeoAlertType.INFO"
                no-close-button
                flat
                class="mb-4"
                :title="upperFirst(t('version', { version: version + 1 }))"
                :text="t('oldVersionAlert')"
              />
            </template>
            <template #append-form-outer>
              <div class="d-flex object-details-actions pt-4" data-component-name="object-details-actions">
                <template v-if="!formDataIsRevision">
                  <v-btn
                    :disabled="loading || !isFormDirty || ability.cannot('manage', 'objects')"
                    class="mb-4"
                    color="primary"
                    flat
                    @click="resetForm"
                  >
                    {{ t('reset') }}
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    :disabled="loading || !isFormDirty || !isFormValid || ability.cannot('manage', 'objects')"
                    class="mb-4"
                    color="primary"
                    flat
                    @click="saveObject"
                  >
                    {{ $t('global.button.save') }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-spacer />
                  <v-btn :disabled="ability.cannot('manage', 'objects')" color="primary" flat @click="restoreObject">
                    {{ t('restore') }}
                  </v-btn>
                </template>
              </div>
            </template>
          </ObjectForm>
          <ObjectUnsavedChangesDialog
            v-model="entityModifiedDialogVisible"
            :item="object"
            @exit="onContinueNavigation"
          />
          <UtilUnloadPrevention :model-value="isFormDirty" />
          <ObjectCreateDialog
            v-model="createDPIADialogVisible"
            object-type="process"
            sub-type="PRO_DPIA"
            :domain-id="domainId"
            @success="onDPIACreated"
          />
          <ObjectLinkDialog
            v-if="object"
            v-model="linkObjectDialogVisible"
            :preselected-filters="{ subType: 'PRO_DPIA' }"
            :object="object"
            @success="onDPIALinked"
          />
        </template>
      </BasePage>
    </template>
  </LayoutPageWrapper>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-objectType-subType-object';
</script>

<script setup lang="ts">
import { Ref } from 'vue';
import { cloneDeep, isEqual, omit, upperFirst } from 'lodash';

import { isObjectEqual } from '~/lib/utils';
import { IVeoEntity, IVeoObjectHistoryEntry, VeoAlertType } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useQuery } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';

onBeforeRouteLeave((to, _from, next) => {
  // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
  if (entityModifiedDialogVisible.value || !isFormDirty.value) {
    next();
  } else {
    // If the form was modified and the dialog is closed, show it and abort navigation
    onContinueNavigation.value = () =>
      router.push({
        name: to.name || undefined,
        params: to.params,
        query: to.query
      });
    entityModifiedDialogVisible.value = true;
    next(false);
  }
});

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const { displaySuccessMessage, displayErrorMessage, expireAlert, displayInfoMessage } = useVeoAlerts();
const { link } = useLinkObject();
const { ability } = useVeoPermissions();
const { mutateAsync: _updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);

const domainId = computed(() => route.params.domain as string);

const modifiedObject = ref<IVeoEntity | undefined>(undefined);
// Data that should get merged back into modifiedObject after the object has been reloaded, useful to persist children of objects while keeping form changes
const wipObjectData = ref<Record<string, any> | undefined>(undefined);

const fetchObjectQueryParameters = computed(() => ({
  domain: route.params.domain as string,
  endpoint: route.params.objectType as string,
  id: route.params.object as string
}));
const fetchObjectQueryEnabled = computed(
  () =>
    !!fetchObjectQueryParameters.value.domain &&
    !!fetchObjectQueryParameters.value.endpoint &&
    !!fetchObjectQueryParameters.value.id
);

const additionalData = ref<any>({});

const {
  data: fetchedObject,
  isFetching: loading,
  isError: notFoundError,
  refetch
} = useQuery(objectQueryDefinitions.queries.fetch, fetchObjectQueryParameters, {
  enabled: fetchObjectQueryEnabled,
  onSuccess: async (data: IVeoEntity) => {
    if (route.params.objectType === 'controls') {
      try {
        const { data: Cis, isFetching: CisIsLoading } = useQuery(
          objectQueryDefinitions.queries.fetchObjectControlImplementations,
          fetchObjectQueryParameters,
          {
            enabled: fetchObjectQueryEnabled
          }
        );
        additionalData.value = { controlImplementations: Cis.value };
      } catch (error) {
        console.error(error);
      } finally {
        additionalData.value = {};
      }
    } else {
      additionalData.value = {};
    }

    // Update modifiedObject with fetched data
    modifiedObject.value = cloneDeep({
      ...data,
      ...additionalData.value
    });
    // On the next tick, object is populated so disabling subtype will work
    nextTick(getAdditionalContext);

    if (wipObjectData.value) {
      modifiedObject.value = {
        ...modifiedObject.value,
        ...wipObjectData.value
      };
      wipObjectData.value = undefined;
    }
  }
});

const object = computed(() => ref<IVeoEntity>({ ...fetchedObject.value, ...additionalData.value }));
watch([additionalData], () => {
  Object.assign(object.value?.value, additionalData.value);
});

onUnmounted(() => {
  expireOptimisticLockingAlert();
});

// Display stuff
const pageWidths = ref<number[]>([3, 9]);
const pageWidthsLg = ref<number[]>([5, 7]);
const pageWidthsXl = ref<number[]>([5, 7]);
const pageTitles = ref<string[]>([t('objectInfo'), t('objectForm')]);

const onPageCollapsed = (collapsedPages: boolean[]) => {
  if (collapsedPages.some((page) => page)) {
    pageWidths.value = [12, 0];
    pageWidthsLg.value = [12, 0];
    pageWidthsXl.value = [12, 0];
  } else {
    pageWidths.value = [3, 9];
    pageWidthsLg.value = [4, 8];
    pageWidthsXl.value = [5, 7];
  }
};

// Forms part specific stuff
const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
const objectType = computed(
  () => Object.entries(endpoints.value || {}).find(([, endpoint]) => endpoint === route.params.objectType)?.[0]
);

const areObjectsEqual = (originalObject: any, modifiedObject: any) => {
  if (!originalObject || !modifiedObject) return true;
  // Compare base properties
  const baseEquality = isObjectEqual(
    { ...originalObject, controlImplementations: undefined },
    { ...modifiedObject, controlImplementations: undefined }
  ).isEqual;

  const additionalPropertiesEquality =
    originalObject.type === 'control' ?
      isObjectEqual(originalObject.controlImplementations, modifiedObject.controlImplementations).isEqual
    : true;

  return baseEquality && additionalPropertiesEquality;
};

const isFormDirty = computed(
  () =>
    !areObjectsEqual(object.value?.value as IVeoEntity, modifiedObject.value as IVeoEntity) && !formDataIsRevision.value
);
const isFormValid = ref(false);
const objectForm = ref();

// Form actions
function resetForm() {
  modifiedObject.value = cloneDeep(object.value);
}

async function saveObject() {
  await updateObject(
    upperFirst(t('objectSaved', { name: object.value?.displayName })),
    upperFirst(t('objectNotSaved'))
  );
  if (!isEqual(object.value?.riskValues, modifiedObject.value?.riskValues)) {
    displayInfoMessage('', upperFirst(t('riskAlert')));
  }
}

async function restoreObject() {
  await updateObject(
    upperFirst(t('objectRestored', { name: object.value?.displayName })),
    upperFirst(t('objectNotRestored'))
  );
}

function updateObjectRelationships() {
  wipObjectData.value = omit(
    cloneDeep(modifiedObject.value),
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'parts',
    'members'
  );
  refetch();
}

const optimisticLockingAlertKey = ref<undefined | number>(undefined);
const expireOptimisticLockingAlert = () => {
  if (optimisticLockingAlertKey.value) {
    expireAlert(optimisticLockingAlertKey.value);
    optimisticLockingAlertKey.value = undefined;
  }
};

async function updateObject(successText: string, errorText: string) {
  expireOptimisticLockingAlert();
  try {
    if (modifiedObject.value && object.value) {
      await _updateObject({
        domain: route.params.domain,
        endpoint: route.params.objectType,
        object: modifiedObject.value
      });
      displaySuccessMessage(successText);
      refetch();
      formDataIsRevision.value = false;
    }
  } catch (e: any) {
    if (e.code === 412) {
      optimisticLockingAlertKey.value = displayErrorMessage(errorText, t('outdatedObject'), {
        defaultButtonText: globalT('global.button.no'),
        actions: [
          {
            text: globalT('global.button.yes'),
            onClick: refetch
          }
        ]
      });
    } else {
      displayErrorMessage(errorText, e.message, {
        details: cloneDeep({
          object: modifiedObject.value,
          objectSchema: objectForm.value.objectSchema,
          error: JSON.stringify(e)
        })
      });
    }
  }
}

// navigation prevention stuff
const entityModifiedDialogVisible = ref(false);
const onContinueNavigation: Ref<CallableFunction> = ref(() => undefined);

// history stuff
const formDataIsRevision = ref(false);
const version = ref(0);

function onShowRevision(data: IVeoObjectHistoryEntry, isRevision: boolean) {
  const displayRevisionCallback = () => {
    formDataIsRevision.value = isRevision;
    entityModifiedDialogVisible.value = false;

    // We have to stringify the content and then manually add the host, as the history api currently doesn't support absolute urls 18-01-2022
    if (isRevision) {
      modifiedObject.value = JSON.parse(JSON.stringify(data.content).replaceAll(/"\//g, `"${config.public.apiUrl}/`));
    } else {
      modifiedObject.value = cloneDeep(object.value);
    }
    // @ts-ignore We don't set the display name when loading objects from the history, so we have to do it here
    modifiedObject.value.displayName = `${data.content.designator} ${data.content.abbreviation || ''} ${
      data.content.name
    }`;
    version.value = data.changeNumber;
  };
  if (isFormDirty.value) {
    onContinueNavigation.value = displayRevisionCallback;
    entityModifiedDialogVisible.value = true;
  } else {
    displayRevisionCallback();
  }
}

// object details stuff
// get active tab by route hash & set route hash by switching tabs
const activeTab = computed<string>({
  get(): string {
    return route.hash.substring(1) || 'childObjects'; // childObjects as default tab
  },
  set(hash: string): void {
    router.push({ hash: `#${hash}`, query: route.query });
  }
});

// pia stuff
const createDPIADialogVisible = ref(false);
const linkObjectDialogVisible = ref(false);

const onDPIACreated = async (newObjectId: string) => {
  if (object.value) {
    await link(object.value, { type: 'process', id: newObjectId });
  }
  createDPIADialogVisible.value = false;
  updateObjectRelationships();
};

const onDPIALinked = () => {
  linkObjectDialogVisible.value = false;
  updateObjectRelationships();
};

// disabling inputs
const additionalContext = ref({});

const getAdditionalContext = () => {
  const disabledSubType =
    object.value?.subType ?
      {
        [`#/properties/subType`]: {
          formSchema: { disabled: true }
        }
      }
    : {};

  // Temporary solution: Disable markdown editor for certain subTypes,
  // and output html instead (see controls/MarkdownEditor.vue)
  const subTypesCTL = ['CTL_Requirement', 'CTL_Module', 'CTL_Safeguard', '-'];
  const subTypesSCN = ['SCN_AppliedThreat', '-'];
  const disabledRequirementCTL =
    subTypesCTL.includes(route.params.subType as string) ?
      {
        ['#/properties/customAspects/properties/control_bpCompendium/properties/control_bpCompendium_content']: {
          formSchema: { disabled: true }
        }
      }
    : {};

  const disabledRequirementSCN =
    subTypesSCN.includes(route.params.subType as string) ?
      {
        ['#/properties/customAspects/properties/scenario_bpCompendium/properties/scenario_bpCompendium_content']: {
          formSchema: { disabled: true }
        }
      }
    : {};

  additionalContext.value = {
    ...disabledSubType,
    ...disabledRequirementCTL,
    ...disabledRequirementSCN
  };
};

watch(() => () => domainId.value, getAdditionalContext, {
  deep: true,
  immediate: true
});
</script>

<i18n>
{
  "en": {
    "notFound": "The object that you requested could not be found.",
    "objectInfo": "object details",
    "objectForm": "form",
    "objectNotRestored": "couldn't restore object",
    "objectNotSaved": "couldn't update object",
    "objectRestored": "\"{name}\" was restored successfully!",
    "objectSaved": "\"{name}\" was updated successfully!",
    "oldVersionAlert": "You are currently viewing an old and readonly version of this object. If you want to update the object based on this data, please click \"restore\" first and then make your changes.",
    "outdatedObject": "This dataset has been edited by another user. Do you want to load the changes?",
    "reset": "reset",
    "restore": "restore",
    "riskAlert": "Changing the potential probability of occurrence\/effect changes risks under certain circumstances. Please check all affected risks!",
    "version": "version {version}"
  },
  "de": {
    "notFound": "Das von Ihnen angeforderte Objekt konnte nicht gefunden werden.",
    "objectInfo": "Objektdetails",
    "objectForm": "Formular",
    "objectNotRestored": "objekt konnte nicht wiederhergestellt werden",
    "objectNotSaved": "objekt konnte nicht aktualisiert werden",
    "objectRestored": "\"{name}\" wurde wiederhergestellt!",
    "objectSaved": "\"{name}\" wurde aktualisiert!",
    "oldVersionAlert": "Ihnen wird eine alte, schreibgeschützte Version dieses Objektes angezeigt. Bitte klicken Sie auf \"Wiederherstellen\", wenn Sie Ihr Objekt basierend auf diesen Daten aktualisieren möchten.",
    "outdatedObject": "Dieser Datensatz wurde bearbeitet nachdem Sie ihn geöffnet haben. Möchten Sie die Daten neu laden?",
    "reset": "zurücksetzen",
    "restore": "wiederherstellen",
    "riskAlert": "Die Änderung der potentiellen Eintrittswahrscheinlichkeit\/Auswirkung ändert unter Umständen Risiken. Bitte prüfen Sie alle betroffenen Risiken!",
    "version": "version {version}"
  }
}
</i18n>
