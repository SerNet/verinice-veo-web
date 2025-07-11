import riskQueryDefinitions from '~/composables/api/queryDefinitions/risks';
import messages from '~/locales/base/pages/unit-domains-domain-risks-matrix.json';
import { useQueryClient } from '@tanstack/vue-query';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import type { IVeoDomainRiskDefinition, IVeoRiskCategory } from '~/types/VeoTypes';

export function useRiskDefinition() {
  const { data: currentDomain } = useCurrentDomain();
  const route = useRoute();

  const riskDefinition = computed(() => {
    return getRiskDefinition(currentDomain.value?.raw, route.params?.definition as string);
  });

  return {
    data: riskDefinition
  };
}

export function getRiskDefinition(domain: IVeoDomain, rType: string): IVeoDomainRiskDefinition | undefined {
  if (!domain?.riskDefinitions || !rType) return;
  return domain.riskDefinitions[rType];
}

export function getRiskCategories(riskDefinition: IVeoDomainRiskDefinition) {
  if (!riskDefinition) return [];
  return riskDefinition.categories;
}

export function getRiskCategory(riskCategories: IVeoRiskCategory[], riskCategoryId: string) {
  if (!riskCategories) return;
  return riskCategories[riskCategoryId];
}

export function useRiskDefinitionUpdate() {
  const { mutateAsync: updateRiskDefinition } = useMutation(riskQueryDefinitions.mutations.update);
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const { setLoading, clearLoading } = useGlobalLoadingState();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
  const config = useRuntimeConfig();
  const { data: currentDomain } = useCurrentDomain();

  return {
    saveRiskDefinition: async function saveRiskDefinition(
      riskDefinition: IVeoDomainRiskDefinition,
      domainId: string = currentDomain.value?.id
    ) {
      if (!domainId) {
        throw new Error(`DomainId is required to put a risk definition: ${domainId}`);
      }

      let loadingId: symbol;
      try {
        loadingId = setLoading(messages?.[locale.value]?.updatingRiskDefinition ?? '');

        await updateRiskDefinition({
          json: riskDefinition,
          riskDefinitionId: riskDefinition.id,
          domainId
        });

        displaySuccessMessage(messages?.[locale.value]?.success ?? '');

        queryClient.invalidateQueries(['domains']);
      } catch (err) {
        handleError(err);
      } finally {
        clearLoading(loadingId);
      }
    }
  };

  function handleError(error: unknown) {
    displayErrorMessage(messages?.[locale.value]?.error.update ?? '');
    if (config.public.debug) console.error(error);
  }
}

import { useQuerySync } from './api/utils/query';
export function useRiskDefinitionEvaluation() {
  const evaluation = ref();

  const { data: currentDomain } = useCurrentDomain();
  const { setLoading, clearLoading } = useGlobalLoadingState();
  const { displayErrorMessage } = useVeoAlerts();
  const { locale } = useI18n();
  const config = useRuntimeConfig();

  async function evaluate(riskDefinition: IVeoDomainRiskDefinition) {
    let loadingId: symbol;
    try {
      loadingId = setLoading();
      evaluation.value = await useQuerySync(riskQueryDefinitions.queries.evaluation, {
        domainId: currentDomain.value.id,
        riskDefinitionId: riskDefinition.id,
        riskDefinition
      });
    } catch (error) {
      if (config.public.debug) console.error(error);
      displayErrorMessage(messages?.[locale.value]?.error.rdEvaluation ?? '');
    } finally {
      clearLoading(loadingId);
    }
  }
  return {
    evaluation,
    evaluate
  };
}
