<!--
   - verinice.veo web
   - Copyright (C) 2026 jae
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
  <BasePage :title="t('breadcrumbs.update')" :has-title-bg="false">
    <BaseContainer>
      <v-row>
        <v-col>
          <v-alert
            v-if="!isLoadingDomainUpdates && domainUpdates?.length"
            :icon="mdiArrowTopRightThin"
            :title="t('updateRecommendedTitle')"
            :text="t('updateRecommendedText')"
            variant="tonal"
            color="warning"
            elevation="2"
          ></v-alert>
        </v-col>
      </v-row>
      <v-row>
        <template v-if="isLoadingDomainUpdates">
          <v-col>
            <v-skeleton-loader type="article" />
            <v-skeleton-loader type="article" />
          </v-col>
        </template>
        <template v-if="!isLoadingDomainUpdates && !domainUpdates?.length">
          <v-col>
            <v-alert
              :icon="mdiAlertCircleOutline"
              :title="t('noDomainUpdatesTitle')"
              :text="t('noDomainUpdatesText')"
              variant="outlined"
              color="info"
              elevation="2"
            ></v-alert>
          </v-col>
        </template>

        <template v-else>
          <v-col v-for="update in domainUpdates" :key="update.id">
            <v-card
              :title="update?.domain?.translations?.[locale]?.name ?? update?.domain?.name ?? ''"
              :subtitle="`${t('currentVersion')}: ${update?.domain?.templateVersion ?? ''}`"
              :text="update?.domain?.translations?.[locale]?.description ?? t('noDescription')"
              :disabled="!!conflictedElementsByUnit?.length"
            >
              <span class="">
                <!-- makte this `latest available version` -->
                <template v-for="updateItem in update.allUpdates" :key="updateItem.id">
                  <span class="bg-surface-light d-flex gap-2 p-4">
                    {{}}
                    <v-card-text>{{ t('availableVersion') }}: {{ updateItem.templateVersion }}</v-card-text>
                    <v-card-actions>
                      <v-btn
                        :prepend-icon="mdiArrowTopRightThin"
                        variant="outlined"
                        size="small"
                        @click="
                          () => {
                            assignIds(update.domain.id, updateItem.id);
                            updateDomain();
                          }
                        "
                        >{{ t('updateUnits') }}</v-btn
                      >
                    </v-card-actions>
                  </span>
                </template>
              </span>
            </v-card>
            <v-spacer class="my-4" />

            <template v-if="conflictedElementsByUnit?.length">
              <v-alert
                :icon="mdiAlertCircleOutline"
                :title="t('conflictsTitle')"
                :text="t('conflictsText')"
                variant="tonal"
                color="error"
                elevation="2"
              ></v-alert>
              <v-spacer class="my-4" />
              <h2 class="small-caps page-title text-h2">Conflicts</h2>
              <v-text> </v-text>
              <v-card class="mx-auto">
                <v-list :items="items"></v-list>
              </v-card>
            </template>
          </v-col>
        </template>
      </v-row>
      <v-row v-if="conflictedElementsByUnit?.length"> </v-row>
    </BaseContainer>
  </BasePage>
</template>
<script lang="ts">
export const ROUTE_NAME = '/domains/update';
</script>

<script setup lang="ts">
import { mdiArrowTopRightThin, mdiAlertCircleOutline } from '@mdi/js';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { HttpError } from '~/requests/crud';
type UpdateError = HttpError<{ conflictedElementsByUnit: ConflictedElementsByUnit[] }>;
type ConflictedElementsByUnit = {
  unit: {
    id: string;
    name: string;
  };
  elements: {
    id: string;
    name: string;
    type: string;
  }[];
};

const { locale, t } = useI18n();

const domainId = ref<string>();
const templateId = ref<string>();
const conflictedElementsByUnit = ref<ConflictedElementsByUnit[]>([]);

const {
  mutate: updateDomain,
  isSuccess: isDomainUpdateSuccess,
  isError: isDomainUpdateError,
  status,
  error: updateError
} = useDomainUpdate(domainId, templateId);

const { data: domainUpdates, isLoading: isLoadingDomainUpdates } = useFetchDomainUpdate();

const items = computed(() => buildListOfConflicts(conflictedElementsByUnit.value, domainId.value));

watch(updateError, () => handleUpdateError(updateError.value as UpdateError));

useUserFeedback({
  isLoading: computed(() => getIsPending(status.value)),
  isSuccess: isDomainUpdateSuccess,
  isError: isDomainUpdateError,
  hasErrorMessage: computed(() => (updateError as Ref<UpdateError>).value?.status != 409)
});

function handleUpdateError(error: UpdateError) {
  if (error?.status != 409) return;
  conflictedElementsByUnit.value = error.data?.conflictedElementsByUnit;
}

function assignIds(_domainId: string, _targetVersion: string) {
  domainId.value = _domainId;
  templateId.value = _targetVersion;
}

function buildListOfConflicts(data: ConflictedElementsByUnit[], domainId: string) {
  const result = [];
  let counter = 1;

  data.forEach((group, groupIndex) => {
    // Add subheader
    result.push({
      type: 'subheader',
      title: `Unit: ${group.unit.name}`
    });

    // Add elements
    group.elements.forEach((element) => {
      result.push({
        title: element.name,
        value: counter++,
        props: {
          to: `/${group.unit.id}/domains/${domainId}/${VeoElementTypePlurals[element.type]}/element.subType/${element.id}`,
          class: 'text-primary text-decoration-underline'
        }
      });
    });

    // Add divider except after last group
    if (groupIndex < data.length - 1) {
      result.push({ type: 'divider' });
    }
  });

  return result;
}
</script>
<i18n src="~/locales/base/pages/domains-update.json"></i18n>
