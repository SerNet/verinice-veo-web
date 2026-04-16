<template>
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
          data-veo-test="domain-update-recommended-alert"
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
            data-veo-test="no-domain-updates-alert"
          ></v-alert>
        </v-col>
      </template>

      <template v-else>
        <!-- Show if there are conflicts, otherwise show the updates -->
        <template v-if="conflictedElementsByUnit?.length">
          <v-col cols="12" data-veo-test="domain-update-conflicts-header">
            <h2 class="small-caps page-title text-h2">{{ t('conflicts') }}</h2>
          </v-col>
          <v-col cols="12">
            <v-alert
              :icon="mdiAlertCircleOutline"
              :title="currentlyUpdatingDomainName"
              :text="t('conflictsText')"
              variant="tonal"
              color="error"
              elevation="2"
              data-veo-test="domain-update-conflicts-alert"
            ></v-alert>
            <v-spacer class="my-4" />
            <v-card class="mx-auto">
              <v-list :items="items" data-veo-test="domain-update-conflicts-list"> </v-list>
            </v-card>
          </v-col>
        </template>
        <!-- If there are no conflicts, show the available updates -->
        <template v-else>
          <v-col cols="12">
            <h2 class="small-caps page-title text-h2" data-veo-test="domain-updates-header">Updates</h2>
          </v-col>
          <v-col v-for="update in domainUpdates" :key="update.id" cols="12">
            <v-card
              :title="update?.domain?.translations?.[locale]?.name ?? update?.domain?.name ?? ''"
              :subtitle="`${t('currentVersion')}: ${update?.domain?.templateVersion ?? ''}`"
              :text="update?.domain?.translations?.[locale]?.description ?? t('noDescription')"
              :disabled="!!conflictedElementsByUnit?.length"
              data-veo-test="domain-update-card"
            >
              <span v-if="update.latestPossibleUpdate?.id" class="d-flex flex-column gap-4">
                <span class="bg-surface-light d-flex gap-2 p-4 pointer-cursor">
                  <v-card-text
                    >{{ t('availableVersion') }}: {{ update.latestPossibleUpdate?.templateVersion ?? '' }}</v-card-text
                  >
                  <v-card-actions>
                    <v-btn
                      :prepend-icon="mdiArrowTopRightThin"
                      variant="outlined"
                      size="small"
                      data-veo-test="domain-update-button"
                      @click="
                        () => {
                          assignIds(update.domain.id, update.latestPossibleUpdate.id);
                          updateDomain();
                        }
                      "
                      >{{ t('updateUnits') }}</v-btn
                    >
                  </v-card-actions>
                </span>
              </span>
            </v-card>
            <v-spacer class="my-4" />
          </v-col>
        </template>
      </template>
    </v-row>
  </BaseContainer>
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
const currentlyUpdatingDomainName = computed(() => {
  if (!domainId.value || !domainUpdates.value) return;
  const update = domainUpdates.value?.find((u) => u.domain.id === domainId.value);
  return update?.domain?.translations?.[locale.value]?.name ?? update?.domain?.name ?? '';
});
const templateId = ref<string>();

const {
  mutate: updateDomain,
  isSuccess: isDomainUpdateSuccess,
  isError: isDomainUpdateError,
  status,
  error: updateError
} = useDomainUpdate(domainId, templateId);

const conflictedElementsByUnit = computed<ConflictedElementsByUnit[]>(() => {
  if (!updateError.value || (updateError.value as UpdateError).status !== 409) return [];
  return (updateError.value as UpdateError).data?.conflictedElementsByUnit ?? [];
});

const { data: domainUpdates, isLoading: isLoadingDomainUpdates } = useFetchDomainUpdate();

const items = computed(() => buildListOfConflicts(conflictedElementsByUnit.value, domainId.value));

useUserFeedback({
  isLoading: computed(() => getIsPending(status.value)),
  isSuccess: isDomainUpdateSuccess,
  isError: isDomainUpdateError,
  hasErrorMessage: computed(() => (updateError as Ref<UpdateError>).value?.status != 409)
});

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
          class: 'text-primary text-decoration-underline pointer-cursor',
          target: '_blank',
          rel: 'noopener noreferrer'
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
