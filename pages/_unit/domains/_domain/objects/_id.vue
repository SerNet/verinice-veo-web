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
  <VeoObjectNotFound v-if="!loading && notFoundError" />
  <VeoPageWrapper
    v-else
    collapsable-left
    collapsable-right
    :page-widths="pageWidths"
    :page-titles="pageTitles"
    @page-collapsed="onPageCollapsed"
  >
    <template
      v-if="!loading && object"
      #header
    >
      <div class="px-4">
        <h1>
          {{ upperFirst(t('breadcrumbs.objects').toString()) }}
        </h1>
        <h2>
          {{ object.displayName }}
        </h2>
      </div>
    </template>
    <template #default>
      <VeoObjectDetails
        :loading="loading"
        :object="object"
      />
      <VeoPage
        fullsize
        content-class="fill-height"
        no-padding
      >
        <template #default>
          <VeoObjectForm
            v-model="modifiedObject"
            :disabled="formDataIsRevision"
            :object-schema="objectSchema"
            :loading="$fetchState.pending"
            :domain-id="domainId"
            :preselected-sub-type="preselectedSubType"
            :valid.sync="isFormValid"
            @input="onFormInput"
            @show-revision="onShowRevision"
          >
            <template
              v-if="formDataIsRevision"
              #prepend-form
            >
              <VeoAlert
                :value="true"
                :type="VeoAlertType.INFO"
                no-close-button
                flat
                :title="upperFirst(t('version', { version: version + 1 }).toString())"
                :text="t('oldVersionAlert')"
              />
            </template>
            <template #append-form-fixed>
              <div
                class="d-flex pt-2 pb-4 white"
                style="border-top: 1px solid #efefef"
              >
                <template v-if="!formDataIsRevision">
                  <v-btn
                    text
                    :disabled="loading || !isFormDirty"
                    @click="resetForm"
                  >
                    {{ t('global.button.reset') }}
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    text
                    color="primary"
                    :disabled="loading || !isFormDirty || !isFormValid"
                    @click="saveObject"
                  >
                    {{ t('global.button.save') }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-spacer />
                  <v-btn
                    text
                    color="primary"
                    @click="restoreObject"
                  >
                    {{ t('restore') }}
                  </v-btn>
                </template>
              </div>
            </template>
          </VeoObjectForm>
          <VeoEntityModifiedDialog
            v-model="entityModifiedDialogVisible"
            :item="object"
            @exit="onContinueNavigation"
          />
          <VeoWindowUnloadPrevention :value="isFormDirty" />
        </template>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, Ref, useAsync, useMeta } from '@nuxtjs/composition-api';
import { cloneDeep, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { Route } from 'vue-router/types';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoObjectHistoryEntry, IVeoObjectSchema, VeoAlertType } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  name: 'VeoObjectsIndexPage',
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if (this.isFormDirty && this.entityModifiedDialogVisible) {
      next();
    } else if (this.isFormDirty) {
      // If the form was modified and the dialog is closed, show it and abort navigation
      this.onContinueNavigation = () => this.$router.push({ name: to.name || undefined, params: to.params, query: to.query });
      this.entityModifiedDialogVisible = true;
      next(false);
    } else {
      // The form wasn't modified, proceed as if this hook doesn't exist
      next();
    }
  },
  setup() {
    const { t } = useI18n();
    const { $api, $config } = useContext();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    const objectParameter = computed(() => {
      return separateUUIDParam(route.value.params.id);
    });
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const object = ref<IVeoEntity | undefined>(undefined);
    const modifiedObject = ref<IVeoEntity | undefined>(undefined);

    const { fetchState, fetch: loadObject } = useFetch(async () => {
      object.value = await $api.entity.fetch(objectParameter.value.type, objectParameter.value.id);
      modifiedObject.value = cloneDeep(object.value);
    });

    const notFoundError = computed(() => (fetchState.error as any)?.statusCode === 404);

    // Display stuff
    const pageWidths = ref<Number[]>([4, 8]);
    const pageTitles = ref<string[]>([t('objectInfo').toString(), t('objectForm').toString()]);

    const onPageCollapsed = (collapsedPages: Boolean[]) => {
      if (collapsedPages.some((page) => page)) {
        pageWidths.value = [12, 0];
      } else {
        pageWidths.value = [3, 9];
      }
    };

    useMeta(() => ({ title: [object.value?.displayName || [], t('breadcrumbs.objects')].flat().join(' - ') }));

    // Forms part specific stuff
    const objectSchema: Ref<IVeoObjectSchema | null> = useAsync(() => $api.schema.fetch(objectParameter.value.type, [domainId.value]));
    const preselectedSubType = computed(() => route.value.query.subType);

    const isFormDirty = ref(false);
    const isFormValid = ref(false);

    function onFormInput() {
      isFormDirty.value = true;
    }

    // Form actions
    function resetForm() {
      isFormDirty.value = false;
      modifiedObject.value = cloneDeep(object.value);
    }

    async function saveObject() {
      await updateObject(t('objectSaved', { name: object.value?.displayName }).toString(), t('objectNotSaved').toString());
    }

    async function restoreObject() {
      await updateObject(t('objectRestored', { name: object.value?.displayName }).toString(), t('objectNotRestored').toString());
    }

    async function updateObject(successText: string, errorText: string) {
      try {
        if (modifiedObject.value && object.value) {
          // @ts-ignore ETag is not defined on the type, however it is set by the api plugin
          modifiedObject.value.$etag = object.value.$etag;
          await $api.entity.update(objectParameter.value.type, objectParameter.value.id, modifiedObject.value);
          loadObject();
          isFormDirty.value = false;
          formDataIsRevision.value = false;
          displaySuccessMessage(successText);
        }
      } catch (e) {
        displayErrorMessage(errorText, JSON.stringify(e));
      }
    }

    // navigation prevention stuff
    const entityModifiedDialogVisible = ref(false);
    const onContinueNavigation: Ref<CallableFunction> = ref(() => undefined);

    // history stuff
    const formDataIsRevision = ref(false);
    const version = ref(0);

    function onShowRevision(data: IVeoObjectHistoryEntry, isRevision: true) {
      const displayRevisionCallback = () => {
        isFormDirty.value = false;
        formDataIsRevision.value = isRevision;

        // We have to stringify the content and then manually add the host, as the history api currently doesn't support absolute urls 18-01-2022
        modifiedObject.value = JSON.parse(JSON.stringify(data.content).replaceAll(/"\//g, `"${$config.apiUrl}/`));
        // @ts-ignore
        modifiedObject.value.displayName = `${data.content.designator} ${data.content.abbreviation || ''} ${data.content.name}`;
        version.value = data.changeNumber;
      };
      if (isFormDirty.value) {
        onContinueNavigation.value = displayRevisionCallback;
        entityModifiedDialogVisible.value = true;
      } else {
        displayRevisionCallback();
      }
    }

    return {
      VeoAlertType,
      domainId,
      entityModifiedDialogVisible,
      formDataIsRevision,
      isFormDirty,
      isFormValid,
      modifiedObject,
      onContinueNavigation,
      onFormInput,
      onShowRevision,
      preselectedSubType,
      resetForm,
      restoreObject,
      saveObject,
      t,
      pageWidths,
      pageTitles,
      version,
      onPageCollapsed,
      loading: fetchState.pending,
      notFoundError,
      object,
      objectSchema,
      upperFirst
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "objectInfo": "objekt details",
    "objectForm": "form",
    "objectNotRestored": "Couldn't restore object",
    "objectNotSaved": "Couldn't update object",
    "objectRestored": "\"{name}\" was restored successfully!",
    "objectSaved": "\"{name}\" was updated successfully!",
    "oldVersionAlert": "You are currently viewing an old and readonly version of this object. If you want to update the object based on this data, please click \"restore\" first and then make your changes.",
    "restore": "restore",
    "version": "version {version}"
  },
  "de": {
    "objectInfo": "Objektdetails",
    "objectForm": "Formular",
    "objectNotRestored": "Objekt konnte nicht wiederhergestellt werden",
    "objectNotSaved": "Objekt konnte nicht aktualisiert werden",
    "objectRestored": "\"{name}\" wurde wiederhergestellt!",
    "objectSaved": "\"{name}\" wurde aktualisiert!",
    "oldVersionAlert": "Ihnen wird eine alte, schreibgeschützte Version dieses Objektes angezeigt. Bitte klicken Sie auf \"Wiederherstellen\", wenn Sie Ihr Objekt basierend auf diesen Daten aktualisieren möchten.",
    "restore": "wiederherstellen",
    "version": "version {version}"
  }
}
</i18n>
