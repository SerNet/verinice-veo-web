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
    class="px-4 bg-basepage"
    collapsable-left
    collapsable-right
    :loading="loading"
    :page-widths="pageWidths"
    :page-widths-xl="pageWidthsXl"
    :page-widths-lg="pageWidthsLg"
    :page-titles="pageTitles"
    data-component-name="object-details-page"
    data-veo-test="object-details-page"
    @page-collapsed="onPageCollapsed"
  >
    <template #default>
      <BasePage
        :title="`${object?.abbreviation ? object.abbreviation + ' ' : ''}${object?.name}`"
        sticky-footer
        data-component-name="object-details-details"
        data-veo-test="object-details-details"
        no-padding
      >
        <template #title>
          <div class="d-inline-flex align-center ml-2">
            <veo-icon
              v-if="object"
              :icon="sourceIconName"
              :tooltip-translation="sourceTooltipText"
              :color="sourceIconColor"
              size="s"
              class="mr-2"
            />
          </div>
        </template>
        <template #default>
          <ObjectDetails
            v-model:active-tab="activeTab"
            class="mb-10"
            :loading="loading"
            :object="object"
            :domain-id="domainId"
            :dense="!!pageWidths[1]"
            @reload="updateObjectRelationships"
          />
        </template>
        <template #footer>
          <div style="height: 36px"></div>

          <ObjectActionMenu
            color="primary"
            :disabled="!canManageUnitContent"
            :object="object"
            :type="activeTab"
            @reload="updateObjectRelationships"
          />
        </template>
      </BasePage>

      <BasePage
        content-class="fill-height"
        no-padding
        no-padding-top
        data-component-name="object-details-form"
        data-veo-test="object-details-form"
      >
        <template #default>
          <ObjectForm
            v-if="objectType"
            ref="objectForm"
            v-model="modifiedObject"
            v-model:valid="isFormValid"
            class="pb-4"
            :disabled="formDataIsRevision || !canManageUnitContent"
            :object-type="objectType"
            :original-object="object"
            :loading="loading || !modifiedObject"
            :domain-id="domainId"
            :additional-context="additionalContext"
            :has-actions-menu="true"
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
              <div
                class="d-flex object-details-actions pt-4"
                data-component-name="object-details-actions"
                data-veo-test="object-details-actions"
              >
                <template v-if="!formDataIsRevision">
                  <v-btn
                    :disabled="loading || !isFormDirty || !canManageUnitContent"
                    class="mb-4"
                    color="primary"
                    flat
                    @click="resetForm"
                  >
                    {{ t('reset') }}
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    :disabled="loading || !isFormDirty || !isFormValid || !canManageUnitContent"
                    class="mb-4"
                    :color="wasSavedSuccessfully ? 'success' : 'primary'"
                    flat
                    @click="saveObject"
                  >
                    <template v-if="wasSavedSuccessfully">
                      <v-icon :icon="mdiCheck" />
                    </template>
                    <template v-else>
                      {{ t('global.button.save') }}
                    </template>
                  </v-btn>
                </template>
                <template v-else>
                  <v-spacer />
                  <v-btn :disabled="!canManageUnitContent" color="primary" flat @click="restoreObject">
                    {{ t('restore') }}
                  </v-btn>
                </template>
              </div>
            </template>
          </ObjectForm>
          <!-- @vue-ignore TODO #3066 not assignable -->
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
import { mdiAccountEdit, mdiBookOpenPageVariantOutline, mdiCheck } from '@mdi/js';
import { cloneDeep, isEqual, omit, upperFirst } from 'lodash';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';
import type { IVeoEntity, IVeoLink, IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import { VeoAlertType, VeoElementTypesSingular } from '~/types/VeoTypes';
import { useQueryClient } from 'vue-query-v5';

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
const { displayErrorMessage, expireAlert, displayInfoMessage } = useVeoAlerts();
const { link } = useLinkObject();
const { ability, subject } = useVeoPermissions();
const { mutateAsync: _updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
const domainId = computed(() => route.params.domain as string);

const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);

const modifiedObject = ref<IVeoEntity | undefined>(undefined);
const baseObject = ref<IVeoEntity | undefined>(undefined);

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

const {
  data: object,
  isFetching: loading,
  isError: notFoundError,
  refetch
} = useQuery(objectQueryDefinitions.queries.fetch, fetchObjectQueryParameters, {
  enabled: fetchObjectQueryEnabled,
  // @ts-ignore TODO #3066 not assignable
  onSuccess: async (data: IVeoEntity) => {
    finalizeModifiedObject(data);
  }
});

const appliedCatalogItem = computed<IVeoLink | undefined>(() => object.value?.appliedCatalogItem);
const sourceIconName = computed(() => (appliedCatalogItem.value ? mdiBookOpenPageVariantOutline : mdiAccountEdit));
const sourceTooltipText = computed(() => (appliedCatalogItem.value ? t('breadcrumbs.catalog') : t('sourceTooltip')));
const sourceIconColor = computed<string | undefined>(() => (appliedCatalogItem.value ? 'blue' : undefined));

// Function to update modifiedObject with fetched data
function finalizeModifiedObject(data?: IVeoEntity) {
  modifiedObject.value = cloneDeep(data);
  baseObject.value = cloneDeep(data);
  // On the next tick, object is populated so disabling subtype will work
  nextTick(getAdditionalContext);

  if (wipObjectData.value) {
    const { controlImplementations, ...restWipData } = wipObjectData.value;
    modifiedObject.value = {
      ...modifiedObject.value,
      ...restWipData
    };
    wipObjectData.value = undefined;
  }
}

onUnmounted(() => {
  expireOptimisticLockingAlert();
});

// Display stuff
const pageWidths = ref<number[]>([3, 9]);
const pageWidthsLg = ref<number[]>([5, 7]);
const pageWidthsXl = ref<number[]>([5, 7]);
const pageTitles = ref<string[]>([t('objectInfo'), t('objectForm')]);

const wasSavedSuccessfully = ref<boolean>(false);

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

const objectType = computed(() => VeoElementTypesSingular[route.params.objectType as string]);

const isFormDirty = computed(
  () =>
    baseObject.value &&
    modifiedObject.value &&
    !isEqual(baseObject.value as IVeoEntity, modifiedObject.value as IVeoEntity) &&
    !formDataIsRevision.value
);
const isFormValid = ref(false);
const objectForm = ref();

// Form actions
function resetForm() {
  modifiedObject.value = cloneDeep(object.value);
}

function handleSaveSuccess() {
  wasSavedSuccessfully.value = true;
  setTimeout(() => {
    wasSavedSuccessfully.value = false;
  }, 2000);
}

async function saveObject() {
  await updateObject(
    upperFirst(t('objectSaved', { name: object.value?.displayName })),
    upperFirst(t('objectNotSaved')),
    handleSaveSuccess
  );

  if (!isEqual(object.value?.riskValues, modifiedObject.value?.riskValues)) {
    displayInfoMessage('', upperFirst(t('riskAlert')), {
      timeout: 3000,
      noCloseButton: true
    });
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

const queryClient = useQueryClient();

async function updateObject(successText: string, errorText: string, callback?: () => void) {
  expireOptimisticLockingAlert();
  try {
    if (modifiedObject.value && object.value) {
      await _updateObject({
        domain: route.params.domain,
        endpoint: route.params.objectType,
        object: modifiedObject.value
      });
      await refetch();
      formDataIsRevision.value = false;
      callback?.();

      // Get updated object history (revisions)
      queryClient.invalidateQueries({
        queryKey: [
          'revisions',
          {
            objectType: route.params.objectType,
            objectId: route.params.object,
            domainId: route.params.domain
          }
        ]
      });
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
    baseObject.value = cloneDeep(modifiedObject.value);
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

<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-object.json"></i18n>
